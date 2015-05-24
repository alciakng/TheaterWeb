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
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
	  
		  console.log(profile);
		  var select = "select * from member where email =: email";
		  var insert = "INSERT INTO MEMBER VALUES ( :email, :password,:name,to_date(:birth,'yyyy/mm/dd'),:sex,0,'D')";
		  
		  //date format change
		  var date = new Date(profile._json.birthday);
		  var d = date.getDate()
		  var m = date.getMonth() + 1;
		  var y = date.getFullYear();
		  var format_date = '' + y + '/' + (m<=9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d);
		  //sex format change
		  var sex;
		  (profile.gender=='male')? sex='남' : sex='여';
		
		  
		 //insert profile.기본 마일리지 0, 클래스 D
		 var member= {
		 email: profile.emails[0].value,
		 password :"facebook",
		 name : profile.displayName,
		 birth : format_date,
		 sex : sex
		 }
		
		  oracledb.getConnection(dbConfig,
	  			function(err,connection){
	  				 if (err) {
	  				      console.error(err.message);
	  				      return;
	  				 }
	  				 connection.execute(select,{email:member.email},{outFormat: oracledb.OBJECT},
	  					function(err,user){
	  				    	console.log(user);
	  						if(err){
	  							console.log(err.message);
	  							return done(err); 
	  						}
	  						if(user.rows.length==0){
	  							connection.execute(insert,member,{autoCommit:true},function(err,result){
									if(err){
										console.log("삽입에러");
			        					return done(err);
			        				}
									connection.release(function(err){
										if(err){
											console.log("삽입시 릴리스에러");
											console.log(err.message);
											return;
										}
										  console.log(result);
										  return done(null,member);
									 })
			        	    	      
								});
	  						}
	  						else{
	  							connection.release(function(err){
									if(err){
										console.log("로그인시 릴리스에러");
										console.log(err.message);
										return;
									}
									  return done(err,user.rows[0]);
								 })
	  						}
	  			    	});
	  	          });  	
	  
  }
);