/**
 * New node file
 */


var FacebookStrategy = require('passport-facebook').Strategy;
//dbConfig
var dbConfig = config('dbconfig.js');
//oracledb module
var oracledb = require('oracledb');

/**
 * Expose
 */

module.exports = new FacebookStrategy({
    clientID: "1439701713010669",
    clientSecret: "d00af0f7c24d7921d6158d37d5f48481",
    callbackURL:"http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
	  
	  console.log(profile);
	  var select = "select * from member where email =: email";
	  var insert = "INSERT INTO MEMBER VALUES ( :email, :password, :name)";
	  
	 //insert profile.
	 var member= {
	 email: profile.emails[0].value,
	 password :"facebook",
	 name: profile.displayName
	 }
	 	
	  oracledb.getConnection(dbConfig,
  			function(err,connection){
  				 if (err) {
  				      console.error(err.message);
  				      return;
  				 }
  				 connection.execute(select,{email:profile.emails[0].value},{outFormat: oracledb.OBJECT},
  					function(err,user){
  				    	console.log(user);
  						if(err){
  							console.log(err.message);
  							return done(err); 
  						}
  						if(user.rows.length==0){
  							connection.execute(insert,member,function(err,result){
								if(err){
									console.log("삽입에러");
		        					return done(err);
		        				}
								connection.commit(function(err){
									if(err){
										console.log("삽입시 커밋에러");
										console.log(err.message);
										return;
									}
								console.log(result);
									  return done(null,member);
								 })
		        	    	      
							});
  						}
  						return done(err,user);
  			    	});
  	          });  
  }
);