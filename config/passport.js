/**
*New node file
*/


//dbConfig
var dbConfig = config('dbconfig.js');
//oracledb module
var oracledb = require('oracledb');

var localLogin = require('./passport/localLogin');
var localSignUp = require('./passport/localSignUp');
var facebook = require('./passport/facebook');
var twitter = require('./passport/twitter');



//passport configuration
module.exports = function(passport){

	passport.serializeUser(function(user,done){
	    console.log('serialize');
		done(null,user);
	});
	
	passport.deserializeUser(function(user, done) {
	   console.log('deserialize');
	   
	   done(null,user);
	 });
	
	  // use these strategies
	  passport.use('local-login',localLogin);
	  passport.use('local-signup',localSignUp);
	  passport.use(facebook);
	  passport.use(twitter);
	
  };