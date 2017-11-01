var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
var passport = require('passport')
/* GET home page. */
router.get('/', function(req, res, next) {
	// Following two lines are passport functions to check if authentication is working
	console.log(req.user);
	console.log(req.isAuthenticated())
	res.render('home', { title: 'Home' });
});

router.get('/profile', authenticationMiddleware(), function(req, res) {
	res.render('profile', {title: 'Profile'})
});

router.get('/login', function(req, res, next) {
	res.render('login', { title: 'Login' });
});
router.post('/login', passport.authenticate(
	'local', {
		successRedirect: '/profile',
		failureRedirect: '/login'
}));

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

		const firstName = req.body.firstName;
		const lastName = req.body.lastName;
		const username = req.body.username;
		const email = req.body.email;
		const password = req.body.password;
		const userType = req.body.userType;

		const db = require('../db.js');

	//Question marks will protect database from malicious input values
	db.query("INSERT INTO users (username,password,email,nameFirst,nameLast,usertype) VALUES (?,?,?,?,?,?)",[username,password,email,firstName,lastName,userType], function(
		error, results, fields) {
		if (error) {
			console.log(error);
			res.render('register', { 
				title: 'Registration Failure' ,
				userError: 'Username already in use'
			});
		}
		else {
			console.log('SELECT userid as user_id FROM users WHERE username=\'' + username + '\'');
			db.query('SELECT userid as user_id FROM users WHERE username=\'' + username + '\'', function(error, results, fields) {
				if (error) throw error;

				const user_id = results[0];
				console.log("USER ID IS");
				console.log(user_id);

				// Passes user_id from query into the passport functions below
				req.login(user_id, function(err) {
					res.redirect('/')
				})
			});
		}

	});

}
});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
});

function authenticationMiddleware () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.redirect('/login')
	}
}

module.exports = router;
