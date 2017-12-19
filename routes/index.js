function convertTimestamp(timestamp) {
  var d = new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
		yyyy = d.getFullYear(),
		mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
		dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
		hh = d.getHours(),
		h = hh,
		min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
		ampm = 'AM',
		time;
			
	if (hh > 12) {
		h = hh - 12;
		ampm = 'PM';
	} else if (hh === 12) {
		h = 12;
		ampm = 'PM';
	} else if (hh == 0) {
		h = 12;
	}
	
	// ie: 2013-02-18, 8:35 AM	
	time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
		
	return time;
}

var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
var passport = require('passport')
/* GET home page. */
router.get('/history',function(req, res, next) {
	const db = require('../db.js');
	db.query("select projname,client,developer,status FROM projects", function(error, results, fields) {
		if (error){
			res.render('history', { 
				title: 'History',
				userError: 'Cannot retrieve project list'
			});
		}
		else {
			var obj = new Object();
			var fullstr = "[";

			for (i = 0; i < results.length; i++){
				obj.projname = results[i].projname;
				obj.client = results[i].client;
				obj.developer = results[i].developer;
				obj.status = results[i].status;
				var jsonString= JSON.stringify(obj);
				fullstr += jsonString + ",";
			}
			if(fullstr.length != 1){
				fullstr = fullstr.slice(0, -1);
			}
			fullstr += "]";
			var fullpass = JSON.parse(fullstr);
			res.render('history', { 
				title: 'History',
				fullresults: fullpass
			});
		}
	});
});
router.post('/searchhistory',function(req, res, next) {
	const db = require('../db.js');
	const query = req.body.query;
	const searchtype = req.body.searchtype;
	console.log(req.body.query);
	console.log(req.body.searchtype);
	if (searchtype == 'users'){
		db.query("select projname,client,developer,status FROM projects WHERE client LIKE '%" + query + "%' OR developer like '%" + query + "%'", function(error, results, fields) {
			if (error){
				res.render('history', { 
					title: 'History',
					userError: 'Cannot retrieve user query return'
				});
			}
			else {
				var obj = new Object();
				var fullstr = "[";

				for (i = 0; i < results.length; i++){
					obj.projname = results[i].projname;
					obj.client = results[i].client;
					obj.developer = results[i].developer;
					obj.status = results[i].status;
					var jsonString= JSON.stringify(obj);
					fullstr += jsonString + ",";
				}
				if(fullstr.length != 1){
					fullstr = fullstr.slice(0, -1);
				}
				fullstr += "]";
				console.log("USER QUERY: " + fullstr);
				var fullpass = JSON.parse(fullstr);
				res.render('history', { 
					title: 'History',
					searchresults: fullpass
				});
			}
		});
	}
	else {
		db.query("select projname,client,developer,status FROM projects WHERE projname LIKE '%" + query + "%'", function(error, results, fields) {
			if (error){
				res.render('history', { 
					title: 'History',
					userError: 'Cannot retrieve project name query return'
				});
			}
			else {
				var obj = new Object();
				var fullstr = "[";

				for (i = 0; i < results.length; i++){
					obj.projname = results[i].projname;
					obj.client = results[i].client;
					obj.developer = results[i].developer;
					obj.status = results[i].status;
					var jsonString= JSON.stringify(obj);
					fullstr += jsonString + ",";
				}
				if(fullstr.length != 1){
					fullstr = fullstr.slice(0, -1);
				}
				fullstr += "]";
				console.log("PROJ QUERY: " + fullstr);
				var fullpass = JSON.parse(fullstr);
				res.render('history', { 
					title: 'History',
					searchresults: fullpass
				});
			}
		});
	}
});
router.get('/', function(req, res, next) {
	const db = require('../db.js');

	db.query("select username,totalrating/numJobs AS averagerating from users order by totalrating/numJobs desc limit 3", function(
		error, results, fields) {
		if (error) {
			console.log(error);
			res.render('home', { 
				title: 'Home',
				userError: 'Error loading top performers'
			});
		}
		else {
			var obj = new Object();
			var topstr = "[";

			for (i = 0; i < results.length; i++){
				obj.number = i + 1;
				obj.rating = results[i].averagerating;
				obj.name = results[i].username;
				var jsonString= JSON.stringify(obj);
				topstr += jsonString + ",";
			}
			if(topstr.length != 1){
				topstr = topstr.slice(0, -1);
			}
			topstr += "]";
			var toppass = JSON.parse(topstr);
			db.query("select username,numJobs from users WHERE usertype = 'client' order by numJobs desc limit 3", function(error, results, fields) {
				if (error) {
					console.log(error);
						res.render('home', { 
						title: 'Home',
						userError: 'Error loading top clients'
					});
				}
				else {
					var obj = new Object();
					var clientstr = "[";

					for (i = 0; i < results.length; i++){
						obj.number = i + 1;
						obj.name = results[i].username;
						obj.numjobs = results[i].numJobs;
						var jsonString= JSON.stringify(obj);
						clientstr += jsonString + ",";
					}
					if(clientstr.length != 1){
						clientstr = clientstr.slice(0, -1);
					}
					clientstr += "]";
					var clientpass = JSON.parse(clientstr);

					res.render('home', { 
						title: 'Home',
						toprated: toppass,
						topjobs: clientpass
					});
				}
			});
		}
	});

});
router.get('/messages', function(req, res, next) {
	const db = require('../db.js');
	console.log("User: " + req.user);

	db.query("SELECT * FROM messages WHERE recipient = ?", [req.user], function(
	error, results, fields) {
		if (error){
			console.log(error);
			res.redirect('/');
		}
		else {
			var obj = new Object();
			var messagestr = "[";
			for (i = 0; i < results.length; i++){
				obj.sender = results[i].sender;
				obj.message = results[i].message;
				obj.id = results[i].messageid;
				var jsonString= JSON.stringify(obj);
				messagestr += jsonString + ",";
			}
			if(messagestr.length != 1){
				messagestr = messagestr.slice(0, -1);
			}
			messagestr += "]";
			var messagepass = JSON.parse(messagestr);
			console.log(messagestr);
			res.render('messages', { 
				title: 'Messages',
				messages: messagepass
			});

		}
	});
});
router.post('/deletemessage', function(req, res, next) {
	const db = require('../db.js');
	console.log("User: " + req.user);
	const id = req.body.messageid;
	console.log("ID: " + id);
	db.query("DELETE FROM messages WHERE messageid = ?",[id], function(
	error, results, fields) {
		if (error) {
			console.log(error);
			res.redirect('/');
		}
		else {
			res.redirect('/messages');
		}
	});
	
});
router.get('/writemessage', function(req, res, next) {
	res.render('writemessage', { 
		title: 'Write A Message'
	});
});
router.post('/writemessage', function(req, res, next) {
	const db = require('../db.js');
	const message = req.body.message;
	const recipient = req.body.recipient;
	console.log("Recipient: "+recipient+" | Message: " + message);

	db.query("SELECT username FROM users WHERE username = ?",[recipient], function(
	error, results, fields) {
		if (error) {
			console.log(error);
			res.redirect('/');
		}
		else if (results.length == 0){
			res.render('writemessage', { 
				title: 'Write A Message',
				userError: 'Sorry that username is not recognized'
			});
		}
		else {
			db.query('INSERT INTO messages (recipient,sender,message) VALUES (?,?,?)',[recipient,req.user,message], function(error, results, fields) {
				if (error){
					console.log(error);
					res.redirect('/');
				}
				else {
					res.render('writemessage', { 
						title: 'Write A Message',
						userError: 'Message sent successfully!'
					});
				}
			});
		}
	});

});

router.get('/marketplace', function(req, res, next) {
	console.log(res.locals.userType);
	const db = require('../db.js');

	var currentdate = Math.round(Date.now()/1000);

	console.log("project date: " + req.body.enddate);
	db.query("SELECT * FROM projects WHERE enddate < " + currentdate, function(
	error, results, fields) {
		if (error) {
			console.log(error);
			res.redirect('/');
		}
		else{
			console.log(results.length);
		}
	});
	db.query("SELECT * FROM projects WHERE status = 'open'", function(
		error, results, fields) {
		if (error) {
			console.log(error);
		}
		else {
			var obj = new Object();
			var projstr = "[";

			for (i = 0; i < results.length; i++){
				obj.usertype = res.locals.userType;
				obj.name = results[i].projname;
				obj.desc = results[i].projdesc;
				obj.client = results[i].client;
				console.log("Lowest bid: " + results[i].lowestbid);
				if (results[i].lowestbid == null) obj.lowestbid = '-';
				else obj.lowestbid = results[i].lowestbid;
				obj.datetime = convertTimestamp(results[i].enddate);
				var jsonString= JSON.stringify(obj);
				projstr += jsonString + ",";
			}
			if(projstr.length != 1){
				projstr = projstr.slice(0, -1);
			}
			projstr += "]";
			var projpass = JSON.parse(projstr);
			res.render('marketplace', { 
				title: 'Marketplace',
				projects: projpass,
				usert: req.user
			});
		}
	});
});

router.post('/marketplace', function(req, res, next) {
	const db = require('../db.js');
	console.log("Proj Name: " + req.body.project);
	const bid = Number(req.body.bid);
	const project = req.body.project;
	db.query('SELECT liquidBal FROM users WHERE username = ?',[req.user], function(error, results, fields) {
		console.log("Bid within: " + bid);
		if (error) {
			console.log(error);
			res.render('marketplace', { 
				title: 'Marketplace' ,
				userError: 'Error retrieving liquid balance. Please try again'
			});
		}
		else if (Number(results[0].liquidBal) < 50) {
			res.render('marketplace', { 
				title: 'Marketplace' ,
				userError: 'Bid not allowed. Insufficient liquid funds to cover potential penalties'
			});
		}
		else {
			db.query('SELECT bidder FROM `' + project + '` WHERE bidder = ?',[req.user], function(error, results, fields) {
				console.log("query if bidder exists length: " + results.length);
				if (error){
					console.log(error);
					res.render('marketplace', { 
						title: 'Marketplace' ,
						userError: 'Error selecting user from project list'
					});
				}
				else if (results.length != 0) {
					db.query('INSERT INTO `' + project + '` (bidder,bidamount) VALUES (?,?) ON DUPLICATE KEY UPDATE bidamount=?',[req.user,bid,bid], function(error, results, fields) {
						if (error){
							console.log(error);
							res.render('marketplace', { 
								title: 'Marketplace' ,
								userError: 'Server Error 1. Please try again'
							});
						}
					});
					res.render('marketplace', { 
						title: 'Marketplace' ,
						userError: 'Bid Accepted! (You\'ve already bid on this project so no additional $50 failure to finish collateral will be subtracted from your liquid assets)'
					});
				}
				else {
					db.query('UPDATE users SET liquidBal = (liquidBal - 50) WHERE username = ?',[req.user], function(error, results, fields) {
						if (error){
							console.log(error);
							res.render('marketplace', { 
								title: 'Marketplace' ,
								userError: 'Change of liquid balance error. Please try again'
							});
						}
						else{
							db.query('INSERT INTO `' + project + '` (bidder,bidamount) VALUES (?,?) ON DUPLICATE KEY UPDATE bidamount=?',[req.user,bid,bid], function(error, results, fields) {
								if (error){
									console.log(error);
									res.render('marketplace', { 
										title: 'Marketplace' ,
										userError: 'Server Error 1. Please try again'
									});
								}
								else {
									res.render('marketplace', { 
										title: 'Marketplace' ,
										userError: 'Bid Accepted!'
									});
								}
							});
							
						}
					});
				}
			});
			
		}
	});
});

router.get('/profile', authenticationMiddleware(), function(req, res) {
	const db = require('../db.js');
	console.log(req.user);
	console.log(res.locals.userType);
	db.query('SELECT email,nameFirst,nameLast,github FROM users WHERE username = ?',[req.user], function(error, results, fields) {
		if (error){
			console.log(error);
			res.render('profile', { 
				title: 'Profile',
				userError: 'Unable to retrieve user info'
			});
		}
		else {

			var userstr = '[{"email":"' + results[0].email + '","firstname":"' + results[0].nameFirst + '","lastname":"' + results[0].nameLast + '","github":"' + results[0].github + '"}]';
			console.log("LIST OF USER INFO: " + userstr);
			var userpass = JSON.parse(userstr);
			db.query('SELECT liquidBal FROM users WHERE username = ?',[req.user], function(error, results, fields) {
				if (error){
					console.log(error);
					res.render('profile', { 
						title: 'Profile',
						userError: 'Unable to retrieve user funds',
					});
				}
				else {
					var liquidFunds = results[0].liquidBal;
					var open = 'open';
					console.log("Liquid Bal: $" + liquidFunds);
					if (res.locals.userType == "Client"){
						console.log("user is a client");
						db.query('SELECT projname FROM projects WHERE client = ? AND status = ?',[req.user,open], function(error, results, fields) {
							if (error){
								console.log(error);
								res.render('/', { 
									title: 'Home',
									userError: "Error retrieving active project list",
									userinfo: userpass
								});
							}
							else {
								var obj = new Object();
								var liststr = "[";

								for (i = 0; i < results.length; i++){
									obj.name = results[i].projname;
									var jsonString= JSON.stringify(obj);
									liststr += jsonString + ",";
								}
								if(liststr.length != 1){
									liststr = liststr.slice(0, -1);
								}
								liststr += "]";
								var listpass = JSON.parse(liststr);
								db.query('SELECT projname FROM projects WHERE client = ? AND status = ?',[req.user,'rating'], function(error, results, fields) {
									if (error){
										console.log(error);
										res.render('/', { 
											title: 'Home',
											userError: 'Error retrieving list of completed projects',
											userinfo: userpass
										});
									}
									else {
										var obj1 = new Object();
										var compstr = "[";

										for (i = 0; i < results.length; i++){
											obj1.projname = results[i].projname;
											var jsonString1= JSON.stringify(obj1);
											compstr += jsonString1 + ",";
										}
										if(compstr.length != 1){
											compstr = compstr.slice(0, -1);
										}
										compstr += "]";
										var clientpass = JSON.parse(compstr);
										res.render('profile', { 
											title: 'Profile',
											projects: listpass,
											funds: liquidFunds,
											projClient: clientpass,
											userinfo: userpass
										});
									}
								});
							}
						});
					}
					else if (res.locals.userType == "Developer"){
						db.query('SELECT * FROM projects WHERE developer = ? AND status =?',[req.user,'indevelopment'], function(error, results, fields) {
							if (error){
								console.log(error);
								res.render('/', { 
									title: 'Home',
									userError: "Error retrieving projects for Developer",
									userinfo: userpass
								});
							}
							else {
								var obj = new Object();
								var projstr = "[";

								for (i = 0; i < results.length; i++){
									console.log(results[i].projname);
									obj.projname = results[i].projname;
									obj.client = results[i].client;
									obj.date =  convertTimestamp(results[i].enddate);
									var jsonString= JSON.stringify(obj);
									projstr += jsonString + ",";
								}
								if(projstr.length != 1){
									projstr = projstr.slice(0, -1);
								}
								projstr += "]";
								console.log(projstr);
								console.log("USERSTRINGINSIDE: " + userstr);
								var projpass = JSON.parse(projstr);
								res.render('profile', { 
									title: 'Profile',
									funds: liquidFunds,
									projDev: projpass,
									userinfo: userpass
								});
							}
						});
					}

					else {
						db.query('SELECT developer,client,winningbid,projname FROM projects WHERE status=?',['underreview'], function(error, results, fields) {
							if (error){
								console.log(error);
								res.render('profile', { 
									title: 'Profile',
									userError: "Error retrieving user info from issue projects"
								});
							}
							else {
								var obj = new Object();
								var reviewstr = "[";
								for (i = 0; i < results.length; i++){
									obj.projname = results[i].projname;
									obj.developer = results[i].developer;
									obj.client = results[i].client;
									obj.bid = results[i].winningbid;

									var jsonString= JSON.stringify(obj);
									reviewstr += jsonString + ",";
								}
								if(reviewstr.length != 1){
									reviewstr = reviewstr.slice(0, -1);
								}
								reviewstr += "]";
								console.log(reviewstr);
								var reviewpass = JSON.parse(reviewstr);
								res.render('profile', { 
									title: 'Profile',
									funds: liquidFunds,
									projreview: reviewpass,
									userinfo: userpass
								});
							}
						});
					}
				}
			});
		}
	});
});
router.post('/projreview', authenticationMiddleware(), function(req, res) {
	const db = require('../db.js');
	const project = req.body.project;
	const decision = req.body.decision;
	const developer = req.body.developer;
	const client = req.body.client;
	console.log("Project: " + req.body.project);
	console.log("Decision: " + req.body.decision);
	console.log("Developer: " + req.body.developer);
	console.log("Client: " + req.body.client);
	if (decision == 'Accept'){
		console.log('IN ACCEPT');
		db.query('SELECT winningbid FROM projects WHERE projname=?',[project], function(error, results, fields) {
			if (error){
				console.log(error);
				res.render('home', {
					title:  'Home',
					userError: 'Error Selecting info from projects (super)'
				});
			}
			else {
				const bid = Number(results[0].winningbid);
				console.log("Bid: " +bid);
				db.query('UPDATE users SET totalBal = (totalBal + .5 * ? - .025 * ?), liquidBal = (liquidBal + .5 * ? - .025 * ? + 50)WHERE username = ?',[bid,bid,bid,bid,developer], function(error, results, fields) {
					if (error){
						console.log(error);
						res.render('home', {
							title:  'Home',
							userError: 'Error updating users with developer with good rating (super) (super)'
						});
					}
					else {
						db.query('UPDATE users SET totalBal = (totalBal - .5 * ? - .025 * ?), liquidBal = (liquidBal - .5 * ? - .025 * ?)WHERE username = ?',[bid,bid,bid,bid,client], function(error, results, fields) {
							if (error){
								console.log(error);
								res.render('home', {
									title:  'Home',
									userError: 'Error updating users with client with good rating (super)'
								});
							}
							else{
								db.query('UPDATE users SET totalBal = (totalBal + .05 * ?), liquidBal = (liquidBal + .05 * ?) WHERE username = ?',[bid,bid,'superuser'], function(error, results, fields) {
									if (error){
										console.log(error);
										res.render('home', {
											title:  'Home',
											userError: 'Error updating SUPERUSER (super)'
										});
									}
									else{
										db.query('UPDATE projects SET status = ? WHERE projname = ?',['closed',project], function(error, results, fields) {
											if (error){
												console.log(error);
												res.render('home', {
													title:  'Home',
													userError: 'Error updating Projects with closed (super)'
												});
											}
											else {
												res.render('home', {
													title:  'Home',
													userError: 'Decision successfully implemented'
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}
	else{
		console.log('IN DENY');
		db.query('SELECT winningbid FROM projects WHERE projname=?',[project], function(error, results, fields) {
			if (error){
				console.log(error);
				res.render('home', {
					title:  'Home',
					userError: 'Error Selecting info from projects (super)'
				});
			}
			else {
				const bid = Number(results[0].winningbid);
				console.log("Bid: " +bid);
				db.query('UPDATE users SET totalBal = (totalBal - .5 * ? - 50), liquidBal = (liquidBal - .5 * ?) WHERE username = ?',[bid,bid,developer], function(error, results, fields) {
					if (error){
						console.log(error);
						res.render('home', {
							title:  'Home',
							userError: 'Error updating users with developer with good rating (super) (super)'
						});
					}
					else {
						db.query('UPDATE users SET totalBal = (totalBal + .5 * ? + 50), liquidBal = (liquidBal + .5 * ? + 50) WHERE username = ?',[bid,bid,client], function(error, results, fields) {
							if (error){
								console.log(error);
								res.render('home', {
									title:  'Home',
									userError: 'Error updating users with client with good rating (super)'
								});
							}

							else{
								db.query('UPDATE projects SET status = ?, WHERE projname = ?',['closed (failed)',project], function(error, results, fields) {
									if (error){
										console.log(error);
										res.render('home', {
											title:  'Home',
											userError: 'Error updating Projects with closed (super)'
										});
									}
									else {
										res.render('home', {
											title:  'Home',
											userError: 'Decision successfully implemented'
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}
});

router.post('/pushtorating', authenticationMiddleware(), function(req, res) {
	const db = require('../db.js');
	const projname = req.body.project;
	console.log("Project name: " + projname);
	db.query('SELECT developer FROM projects WHERE projname=?',[projname], function(error, results, fields) {
		if (error){
			console.log(error);
			res.render('/', { 
				title: 'Home',
				userError: "Error selecting developer name of completed project"
			});
		}
		else {
			const devname = results[0].developer;
			console.log("Developer: " + devname);
			res.render('ratingDev', { 
				title: 'Rate ' + devname,
				projname: projname,
				userbeingrated: devname
			});
		}
	});
});
router.post('/projComplete', authenticationMiddleware(), function(req, res) {
	const db = require('../db.js');
	const projname = req.body.proj;
	console.log("Project name: " + projname);
	const clientname = req.body.client;
	console.log("Client name: " + clientname);
	res.render('rating', { 
		title: 'Rate ' + clientname,
		projname: projname,
		userbeingrated: clientname
	});
});
router.get('/rating', authenticationMiddleware(), function(req, res) {
	const db = require('../db.js');

});
router.post('/rating', authenticationMiddleware(), function(req, res) {
	const db = require('../db.js');
	const rating = req.body.rating;
	console.log("Rating: " + rating);
	console.log("User being rated: " + req.body.userbeingrated)
	console.log("Project: " + req.body.projname);
	
	var message;
	if (req.body.message.length == 0){
		message = req.user + " gave you a rating of " + rating + " for the project " + req.body.projname;
	}
	else {
		message = req.body.message;
	}
	console.log("Message: " + message);
	db.query('UPDATE projects SET status = ?, clientrating = ? WHERE projname = ?',['rating',rating,req.body.projname], function(error, results, fields) {
		if (error){
			console.log(error);
			res.render('home', {
				title:  'Home',
				userError: 'Error updating project table111',
			});
		}
		else{
			db.query('UPDATE users SET totalrating = (totalrating + ?), numJobs = (numJobs + 1) WHERE username = ?',[rating,req.body.userbeingrated], function(error, results, fields) {
				if (error){
					console.log(error);
					res.render('home', {
						title:  'Home',
						userError: 'Error updating users with client rating',
					});
				}
				else {
					db.query('INSERT INTO messages (recipient,sender,message) VALUES (?,?,?)',[req.body.userbeingrated,req.user,message], function(error, results, fields) {
						if (error){
							console.log(error);
							res.redirect('/');
						}
						else {
							res.render('home', {
								title:  'Home',
								userError: 'You successfully rated ' + req.body.userbeingrated
							});
						}
					});
				}
			});
		}
	});
});
router.post('/ratingDev', authenticationMiddleware(), function(req, res) {
	const db = require('../db.js');
	const rating = req.body.rating;
	console.log("Rating: " + rating);
	console.log("User being rated: " + req.body.userbeingrated)
	console.log("Project: " + req.body.projname);
	var message;
	if (req.body.message.length == 0){
		message = req.user + " gave you a rating of " + rating + " for the project " + req.body.projname;
	}
	else {
		message = req.body.message;
	}
	db.query('UPDATE users SET totalrating = (totalrating + ?), numJobs = (numJobs + 1) WHERE username = ?',[rating,req.body.userbeingrated], function(error, results, fields) {
		if (error){
			console.log(error);
			res.render('home', {
				title:  'Home',
				userError: 'Error updating project table'
			});
		}
		else{
			if ( rating < 3){
				db.query('UPDATE projects SET status = ?, devrating = ? WHERE projname = ?',['underreview',rating,req.body.projname], function(error, results, fields) {
					if (error){
						console.log(error);
						res.render('home', {
							title:  'Home',
							userError: 'Error updating projects with under-review'
						});
					}
					else {
						res.render('home', {
							title:  'Home',
							userError: 'Thanks for your rating! The superuser will be notified of the developers poor performance'
						});
					}
				});
			}
			else{
				db.query('SELECT winningbid FROM projects WHERE projname=?',[req.body.projname], function(error, results, fields) {
					if (error){
						console.log(error);
						res.render('home', {
							title:  'Home',
							userError: 'Error Selecting info from projects'
						});
					}
					else {
						const bid = Number(results[0].winningbid);
						console.log("Bid: " +bid);
						db.query('UPDATE users SET totalBal = (totalBal + .5 * ? - .025 * ?), liquidBal = (liquidBal + .5 * ? - .025 * ? + 50)WHERE username = ?',[bid,bid,bid,bid,req.body.userbeingrated], function(error, results, fields) {
							if (error){
								console.log(error);
								res.render('home', {
									title:  'Home',
									userError: 'Error updating users with developer with good rating'
								});
							}
							else {
								db.query('UPDATE users SET totalBal = (totalBal - .5 * ? - .025 * ?), liquidBal = (liquidBal - .5 * ? - .025 * ?)WHERE username = ?',[bid,bid,bid,bid,res.locals.userName], function(error, results, fields) {
									if (error){
										console.log(error);
										res.render('home', {
											title:  'Home',
											userError: 'Error updating users with client with good rating'
										});
									}
									else{
										db.query('UPDATE users SET totalBal = (totalBal + .05 * ?), liquidBal = (liquidBal + .05 * ?) WHERE username = ?',[bid,bid,'superuser'], function(error, results, fields) {
											if (error){
												console.log(error);
												res.render('home', {
													title:  'Home',
													userError: 'Error updating SUPERUSER'
												});
											}
											else{
												db.query('UPDATE projects SET status = ?, devrating = ? WHERE projname = ?',['closed',rating,req.body.projname], function(error, results, fields) {
													if (error){
														console.log(error);
														res.render('home', {
															title:  'Home',
															userError: 'Error updating Projects with closed'
														});
													}
													else {
														db.query('INSERT INTO messages (recipient,sender,message) VALUES (?,?,?)',[req.body.userbeingrated,req.user,message], function(error, results, fields) {
															if (error){
																console.log(error);
																res.render('home', {
																	title:  'Home',
																	userError: 'Error sending message'
																});
															}
															else {
																res.render('home', {
																	title:  'Home',
																	userError: 'You successfully rated ' + req.body.userbeingrated
																});
															}
														});
													}
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		}
	});
});

router.post('/profiledeposit', authenticationMiddleware(), function(req, res) {
	const db = require('../db.js');
	const deposit = Number(req.body.deposit);
	const liquidFunds = Number(req.body.money);
	console.log("$" + deposit);
	if (liquidFunds + deposit < 0) {
		res.render('profile', {
			title:  'Profile',
			userError: 'Withdrawl unsuccessful. Unsuffecient funds',
			funds: liquidFunds
		});
	}
	else{
		db.query('UPDATE users SET liquidBal = (liquidBal + ?), totalBal = (totalBal + ?) WHERE username = ?',[deposit,deposit,req.user], function(error, results, fields) {
			if (error){
				console.log(error);
				res.render('profile', { 
					title: 'Profile',
					userError: 'Server Error. Please try again',
					funds: liquidFunds
				});
			}
			else {
				res.render('profile', {
					title:  'Profile',
					userError: 'Deposit successful!',
					funds: liquidFunds + deposit
				});

			}
		});
	}
});

router.post('/profileproject', authenticationMiddleware(), function(req, res) {
	const db = require('../db.js');
	const projname = req.body.project;
	console.log("Project chosen: " + req.body.project)

	db.query('SELECT * FROM `' + projname + '`', function(error, results, fields){
		if (error){
			console.log(error);
			res.render('profile', { 
				title: 'Profile',
				userError: 'Error retrieving project',
			});
		}
		else {
			var obj = new Object();
			var bidstr = "[";

			for (i = 0; i < results.length; i++){

				obj.name = results[i].bidder;
				obj.bid = results[i].bidamount;

				var jsonString= JSON.stringify(obj);
				bidstr += jsonString + ",";
			}
			if(bidstr.length != 1){
				bidstr = bidstr.slice(0, -1);
			}
			bidstr += "]";
			var bidpass = JSON.parse(bidstr);
			res.render('clientprojectlist', { 
				title: projname,
				bids: bidpass,
			});

		}
	});
});
router.post('/developerchoice', authenticationMiddleware(), function(req, res) {
	const db = require('../db.js');

	var developerandbid = req.body.developerandbid;
	var devandbidarray = developerandbid.split("*^*");
	const developer = devandbidarray[0];
	const bid = Number(devandbidarray[1]);
	console.log("Developer chosen: " + developer);
	console.log("Bid amount: $" + bid);
	console.log("Project Name: " + req.body.project);
	const project = req.body.project;
	db.query('SELECT liquidBal FROM users WHERE username = ?',[req.user], function(error, results, fields) {
		console.log("Bid within: " + bid);
		if (error) {
			console.log(error);
			res.render('home', { 
				title: 'Home' ,
				userError: 'Failed to lookup liquid balance for ' + developer
			});
		}
		else if(results[0].liquidBal < bid){
			res.render('home', { 
				title: 'Home' ,
				userError: 'You do not have enough available funds to pay ' + developer
			});
		}
		else {
			//Delete project table
			db.query('DROP TABLE `' + project + '`', function(error, results, fields){
				if (error){
					console.log(error);
					res.render('home', { 
						title: 'Home' ,
						userError: 'Error Dropping project table '
					});
				}
				else{
					console.log("Project table dropped");
					console.log(developer);

					//Assign developer and change status 
					db.query('UPDATE projects SET developer = ?, status = ?, winningbid = ? WHERE projname = ? ',[developer,'indevelopment',bid,project], function(error, results, fields){
						if (error){
							console.log(error);
							res.render('home', { 
								title: 'Home' ,
								userError: 'Error updating projects table '
							});
						}
						else{
							console.log("Projects table updated");

							//Add half of money to developer liquid and total
							db.query('UPDATE users SET totalBal = (totalBal + .5*' + bid + '), liquidBal = (liquidBal + .5*' + bid + ') WHERE username = ?',[developer], function(error, results, fields){
								if (error){
									console.log(error);
									res.render('home', { 
										title: 'Home' ,
										userError: 'Error updating projects table (ADDING TO DEV)'
									});
								}
								else{
									console.log("Money added to developers account");

									//Drop half of money from client liquid and total
									db.query('UPDATE users SET totalBal = (totalBal - .5*' + bid + '), liquidBal = (liquidBal - ' + bid + ') WHERE username = ?',[req.user], function(error, results, fields){
										if (error){
											res.render('home', { 
												title: 'Home' ,
												userError: 'Error updating projects table (SUBBING FROM CLIENT)'
											});
										}
										else{
											console.log("Client money withdrawn and added to developers account");
											res.render('home', { 
												title: 'Home' ,
												userError: 'Congratulations! ' + developer + ' has been assigned the project ' + project
											});
										}
									});							
								}								
							});		
						}
					});
				}
			});
		}
	});
});
router.get('/logout', function(req, res, next) {
	req.logout();
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
				title: 'Login' ,
				userError: 'Login failed: Username/Password not found'
			});
		}
		else if (password != results[0].password){
			const passwordDB = results[0].password;
			console.log("Found user");
			console.log("Entered Password: " + password);
			console.log("Database Password: " + passwordDB);
			res.render('login', { 
				title: 'Login' ,
				userError: 'Login failed: Incorrect Password'
			});
		}
		else {
			db.query('SELECT * FROM firstlogin WHERE username = ?',[username], function(error, results, fields) {
				if (results.length === 0) {

					db.query('SELECT usertype,warnings FROM users WHERE username = ?',[username], function(error, results, fields) {
						console.log(results[0].usertype + " | " + results[0].warnings)
						var warnings = Number(results[0].warnings) + 1;
						console.log("warnings +1 : " + warnings);
						if (error) {
							console.log('1');
							console.log(error);
							res.redirect('/');
						}

						else if (results[0].usertype == 'blocked'){
							console.log('2');
							res.render('login', { 
								title: 'Login' ,
								userError: 'Sorry but you have been denied entry by the superuser'
							});
						}
						else if (Number(results[0].warnings) > 1){
							console.log('3');
							console.log("INHERE");
							db.query("UPDATE users SET usertype='blocked' WHERE username = ?",[username], function(error, results, fields) {
								if (error) {
									console.log(error);
									res.redirect('/');
								}
								else {
									console.log("Final login");
									req.login(username, function(err) {
										res.redirect('/')
									});
								}
							});
						}
						else {
							console.log("Login Successful!");
							req.login(username, function(err) {
								res.redirect('/')
							});
						}
					});
				}
				else {
					res.render('firstloginsplash', {
						title: 'First login',
						user: results[0].username,
						decision: results[0].decision,
						message: results[0].message
					});
				}
			});
		}
	});
});
router.get('/register', function(req, res, next) {
	res.render('register', { title: 'Register' });
});
router.post('/register', function(req, res, next) {
	req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
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
	const password = req.body.password;
	const userType = req.body.userType;
	const approval = 'Awaiting Approval';
	const db = require('../db.js');
		
	//Question marks will protect database from malicious input values
	db.query("INSERT INTO users (username,password,usertype) VALUES (?,?,?)",[username,password,approval], function(
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
			db.query("INSERT INTO awaitingapproval (username,usertype) VALUES (?,?)",[username,userType], function(
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
router.post('/firstlogin', function(req, res, next) {
	const db = require('../db.js');
	const user = req.body.user;
	const decision = req.body.decision;
	console.log("user: " + user + " | Decision: " + decision);

	db.query("DELETE FROM firstlogin WHERE username = ?",[user], function(error, results, fields) {
		if (error) {
			console.log(error);
			res.redirect('/');
		}
	});	

	if (decision == 'Accept'){
		req.login(user, function(err) {
			res.redirect('/updateinfo')
		});
	}
	else {
		res.redirect('/');
	}

	

});
router.get('/updateinfo', function(req, res, next) {
	const db = require('../db.js');
	res.render('updateinfo', { 
		title: 'Additional Information'
	});
});

router.post('/updateinfo', function(req, res, next) {
	const db = require('../db.js');
	const email = req.body.email;
	const password = req.body.password;
	const github = req.body.github;
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	console.log("User: " + res.locals.userName + " | Email: " + email + " | password: " + password + " | github: " + github);
	db.query("UPDATE users SET email = ?, password = ?, github = ?, nameFirst = ?, nameLast = ? WHERE username = ?",[email,password,github,firstname,lastname,res.locals.userName], function(
		error, results, fields) {
		if (error) {
			console.log(error);
		}		
	});
	res.redirect('/profile');
});

router.get('/applicants', authenticationMiddleware(), function(req, res, next) {
	const db = require('../db.js');
	const type = 'Awaiting Approval';
	var approvalIsEmpty;
	db.query('SELECT * FROM awaitingapproval', function(error, results, fields) {
		if (results.length === 0) {
			approvalIsEmpty = true;
			res.render('applicants', { 
					title: 'Application Approval' ,
					isEmpty: approvalIsEmpty
			});
		}
		else {
			approvalIsEmpty = false;
			res.render('applicants', { 
					title: 'Application Approval' ,
					isEmpty: approvalIsEmpty,
					users: results
			});
		}
	});
});
router.post('/applicants', authenticationMiddleware(), function(req, res, next) {
	const db = require('../db.js');
	const decision = req.body.decision;
	const user = req.body.user;
	const message = req.body.message;
	console.log('user: ' + user + " | message: " + message + " | approveDeny: " + decision);
	db.query("SELECT usertype FROM awaitingapproval WHERE username= ?",user, function(
	error, results, fields) {
		if (error) {
			console.log(error);
			res.redirect('/');
		}
		else {
			const usertype = results[0].usertype;
			
			db.query('INSERT INTO firstlogin (username,decision,message) VALUES (?,?,?)',[user,decision,message], function(
			error, results, fields) {
				if (error) {
					console.log("INSERT ERROR" + error);
					res.redirect('/');
				}
				else {
					if (decision=='Accept'){
						db.query("UPDATE users SET usertype = ? WHERE username = ?",[usertype,user], function(
						error, results2, fields) {
							if (error) {
								console.log("UPDATE1 ERROR" + error);
								res.redirect('/');
							}
						});
					}
					else {
						db.query("UPDATE users SET usertype = 'blocked' WHERE username = ?",[user], function(
						error, results2, fields) {
							if (error) {
								console.log("UPDATE2 ERROR" + error);
								res.redirect('/');
							}
						});
					}
					db.query("DELETE FROM awaitingapproval WHERE username= ?",[user], function(error, results3, fields) {
						if (error) {
							console.log("DELETE ERROR" + error);
							res.redirect('/');
						}
					});
					console.log("SUCCESS IN DECISION ON USER");
					res.redirect('/applicants');
				}
			});
		}
	});
	
});
router.get('/newproject', authenticationMiddleware(), function(req, res, next) {
	console.log(req.user);
	console.log(req.isAuthenticated());
	res.render('newproject', { title: 'Create Project' });
});
router.post('/newproject', authenticationMiddleware(), function(req, res, next) {
	const db = require('../db.js');
	const projname = req.body.projectname;
	const projdesc = req.body.projDesc;
	console.log(req.user);
	console.log(req.isAuthenticated());

	var projdate = new Date(req.body.enddate);
	projdate = Math.round(projdate.getTime()/1000)+18000;
	var currentdate = Math.round(Date.now()/1000);
	console.log("Project name: " + projname);
	console.log("Project desc: " + projdesc);
	console.log("project date: " + req.body.enddate);
	console.log("Project date: " + projdate);
	console.log("time now: " + currentdate);

	req.checkBody('projectname', 'Projects must be between 6-40 characters long.').len(4, 40);
	req.checkBody('projDesc', 'Please enter a project description between 5-500 characters long.').len(5,500);
	const errors = req.validationErrors();

	if (errors) {
		console.log(`errors: ${JSON.stringify(errors)}`);
		res.render('newproject', { 
			title: 'Project Creation Failure' ,
			errors: errors
		});
	}
	else if (projdate < currentdate + 60)
		res.render('newproject', { 
			title: 'Project Creation Failure' ,
			userError: 'Please enter a date/time combination that allows for at least 60 seconds of bidding'
		});

	else {
		db.query('SELECT * FROM projects WHERE projname = ?',[projname], function(error, results, fields) {
			if (error) {
				console.log(error);
			}
			else if (results.length != 0) {
				res.render('newproject', { 
					title: 'Project Failure' ,
					userError: 'Sorry project name has already been used. Please pick another'
				});
			}
			else {
				db.query("INSERT INTO projects (projname,projdesc,enddate,client) VALUES (?,?,?,?)",[projname,projdesc,projdate,req.user], function(
				error, results, fields) {
					if (error) {
						console.log(error);
						res.render('newproject', { 
							title: 'Project Creation Failure' ,
							userError: 'Server Error. Please try again'
						});
					}
				});
				db.query("CREATE TABLE `" + projname + "` (`bidder` VARCHAR(45) NOT NULL,`bidamount` INT NULL,PRIMARY KEY (`bidder`));", function(
				error, results, fields) {
					if (error) {
						console.log(error);
						res.render('newproject', { 
							title: 'Project Creation Failure' ,
							userError: 'Server Error. Please try again'
						});
					}
					res.render('marketplace', { 
						title: 'Marketplace' ,
						userError: 'Project created successfully!'
					});
				});
			}
		});
	}
});
passport.serializeUser(function(username, done) {
	done(null, username);
});
passport.deserializeUser(function(username, done) {
	done(null, username);
});
function authenticationMiddleware () {  
	return (req, res, next) => {
		//console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
		if (req.isAuthenticated()) return next();
		res.redirect('/login')
	}
}

module.exports = router;
