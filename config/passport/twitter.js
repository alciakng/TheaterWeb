/**
 * New node file
 */


var TwitterStrategy = require('passport-twitter').Strategy;
//dbConfig
var dbConfig = config('dbconfig.js');
//oracledb module
var oracledb = require('oracledb');

module.exports = new TwitterStrategy({
    consumerKey: "6R0r7JgUgxijTnEosgqYgDGZF",
    consumerSecret: "bLiTMjFkhX09MtyEdOD8dMdEGPI10pIQHyoOMcvPEhpSv7nmIt",
    callbackURL:"http://localhost:3000/auth/twitter/callback"
  },
  function(accessToken, refreshToken, profile, done) {
	  
	  console.log(profile);
	  var select = "select * from member where email =: email";
	  var insert = "INSERT INTO MEMBER VALUES ( :email, :password, :name)";
	  
	 //insert profile.
	 var member= {
	 email: profile.emails[0].value,
	 pw :"twitter",
	 name: profile.displayName
	 }
	 	
	  oracledb.getConnection(dbConfig,
  			function(err,connection){
  				 if (err) {
  				      console.error(err.message);
  				      return;
  				 }
  				 connection.execute(select,{email:member.email}.email,{outFormat: oracledb.OBJECT},
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
		        					return done(null,null,req.flash('signUpMessage','db점검 중 입니다..'));
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