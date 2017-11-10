var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
var passport = require('passport')
/* GET home page. */
router.get('/', function(req, res, next) {
	// Following two lines are passport functions to check if authentication is working
	console.log(req.user);
	console.log(req.isAuthenticated());
	
	res.render('home', { title: 'Home' });
});

router.get('/profile', authenticationMiddleware(), function(req, res) {
	console.log(req.user);
	console.log(req.isAuthenticated());
	res.render('profile', {title: 'Profile'})
});

router.get('/logout', function(req, res, next) {
	req.logout()
    req.session.destroy(() => {
        res.clearCookie('connect.sid')
        res.redirect('/');
    })
	
});

router.get('/login', function(req, res, next) {
	res.render('login', { title: 'Login' });
});

router.post('/login', function(req, res, next) {

	const username = req.body.username;
	const password = req.body.password;
	const db = require('../db.js');

	//Question marks will protect database from malicious input values
	db.query('SELECT password FROM users WHERE username = ?',[username], function(error, results, fields) {
		
		if (results.length === 0) {
			res.render('login', { 
				title: 'Login Failed' ,
				userError: 'Login failed: Username/Password not found'
			});
		}
		else if (password != results[0].password){
			const passwordDB = results[0].password;
			console.log("Found user");
			console.log("Entered Password: " + password);
			console.log("Database Password: " + passwordDB);
			res.render('login', { 
				title: 'Login Failed' ,
				userError: 'Login failed: Incorrect Password'
			});
		}
		else {
			console.log("Login Successful!");
			req.login(username, function(err) {
					res.redirect('/')
			});
		}
	});
});

router.get('/register', function(req, res, next) {
	res.render('register', { title: 'Register' });
});
router.post('/register', function(req, res, next) {
	req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
	req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
	req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 45);
	req.checkBody('password', 'Password must be between 8-30 characters long.').len(8, 30);
	req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(req.body.password);

	const errors = req.validationErrors();

	if (errors) {
		console.log(`errors: ${JSON.stringify(errors)}`);
		res.render('register', { 
			title: 'Registration Failure' ,
			errors: errors
		});
	}
	else {
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
	const userType = req.body.userType;
	const approval = 'Awaiting Approval';
	const db = require('../db.js');
		
	//Question marks will protect database from malicious input values
	db.query("INSERT INTO users (username,password,email,usertype) VALUES (?,?,?,?)",[username,password,email,approval], function(
		error, results, fields) {
		if (error) {
			console.log(error);
			res.render('register', { 
				title: 'Registration Failure' ,
				userError: 'Username already in use'
			});
		}
		else {
			// Inserts user into awaitingapproval DB
			db.query("INSERT INTO awaitingapproval (username,userType) VALUES (?,?)",[username,userType], function(
			error, results, fields) {
			if (error) console.log(error);
			});
			// Passes username from query into the passport functions below
			req.login(username, function(err) {
				res.redirect('/')
			})
		}
	});
}
});
router.get('/applicants', function(req, res, next) {

	const db = require('../db.js');
	const type = 'Awaiting Approval';
	var approvalIsEmpty;
	db.query('SELECT * FROM users WHERE usertype = ?',[type], function(error, results, fields) {
		if (results.length === 0) {
			console.log('no users For Approval');
			approvalIsEmpty = true;
			res.render('applicants', { 
					title: 'Application Approval' ,
					isEmpty: approvalIsEmpty
			});
		}
		else {
			console.log('Some users need Approval');
			approvalIsEmpty = false;
			res.render('applicants', { 
					title: 'Application Approval' ,
					isEmpty: approvalIsEmpty,
					users: results
			});
		}
		
	});
	
});

router.post('/applicants', function(req, res, next) {

	const approveDeny = req.body.acceptDeny;
	const usersChecked = req.body.usersCheck;
	const numUsersChecked = usersChecked.length;
	var messages = req.body.reasonMessage;
	for (i=0;i<messages.length;i++){
		if (messages[i]=='')
			messages[i]='dummy fill';
	}
	console.log("What is their FATE?? " + approveDeny);
	console.log("Users checked: " + usersChecked + " Totaling " + numUsersChecked);
	console.log("Messages: " + messages);
	

	const db = require('../db.js');

	res.render('splashTemp', { 
			title: 'Splash'
	});
	//Question marks will protect database from malicious input values
	// db.query('SELECT password FROM users WHERE username = ?',[username], function(error, results, fields) {
		
	// 	if (results.length === 0) {
	// 		res.render('login', { 
	// 			title: 'Login Failed' ,
	// 			userError: 'Login failed: Username/Password not found'
	// 		});
	// 	}
	// 	else if (password != results[0].password){
	// 		const passwordDB = results[0].password;
	// 		console.log("Found user");
	// 		console.log("Entered Password: " + password);
	// 		console.log("Database Password: " + passwordDB);
	// 		res.render('login', { 
	// 			title: 'Login Failed' ,
	// 			userError: 'Login failed: Incorrect Password'
	// 		});
	// 	}
	// 	else {
	// 		console.log("Login Successful!");
	// 		req.login(username, function(err) {
	// 				res.redirect('/')
	// 		});
	// 	}
	// });
});
passport.serializeUser(function(username, done) {
	done(null, username);
});

passport.deserializeUser(function(username, done) {
	done(null, username);
});

function authenticationMiddleware () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

		if (req.isAuthenticated()) return next();
		res.redirect('/login')
	}
}

module.exports = router;
