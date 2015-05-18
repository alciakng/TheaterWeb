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
	  //로컬을 쓸 때 앞에 별칭을 붙여 router.js에서 불러올 때 별칭으로 사용한다.
	  passport.use('local-login',localLogin);
	  passport.use('local-signup',localSignUp);
	  passport.use(facebook);
	  passport.use(twitter);
	
};