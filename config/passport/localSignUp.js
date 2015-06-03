/**
 * New node file
 */
/**
 * New node file
 */
//로그인 모듈
var LocalStrategy = require('passport-local').Strategy;
//dbConfig
var dbConfig = config('dbconfig.js');
//oracledb module
var oracledb = require('oracledb');

	
//signup
module.exports  = new LocalStrategy({
	            // by default, local strategy uses username and password, we will override with email
	            usernameField : 'email',
	            passwordField : 'password',
	            passReqToCallback : true // allows us to pass back the entire request to the callback
	        },
	        function(req, email, password, done){
	        	
	        	var select = "select * from MEMBER where email = :email";
	        	var insert = "INSERT INTO MEMBER VALUES (:email,:password,:name,to_date(:birth,'yy-mm-dd'),:sex,0,'D')";
	        	
	        	oracledb.getConnection(dbConfig,
	        			function(err,connection){
	        				 if (err) {
	        				      console.error(err.message);	
	        				      return;
	        				 }
	        				 connection.execute(select,[email],{outFormat: oracledb.OBJECT,autoCommit:true},
	        					function(err,user){
	        				    	console.log(user);
	        						if(err){
	        							console.error(err.message);
	        							return done(err,req.flash('signUpMessage','인터넷 연결을 확인하세요'));
	        						}
	        						if(user.rows.length>0){
	        							connection.release(function(err){
	        								 if(err){
	        									 console.log(err.message);
	        									 return;
	        								 }
	        							 return done(null,null,req.flash('signUpMessage','이미 존재하는 이메일 입니다..'));
	        							 });
	        							
	        						}
	        						else{
	        							console.log(req.body);
	        							connection.execute(insert,req.body,{autoCommit:true},function(err,result){
		        							 if(err){
		        								console.error(err.message);
		        								console.log("삽입에러");
		        		        				return done(null,null,req.flash('signUpMessage','db점검 중 입니다..'));
		        		        			 } 
		        							 console.log('회원가입성공!');
		        							 connection.release(function(err){
		        								 if(err){
		        									 console.log(err.message);
		        									 return;
		        								 }
		        								 
		        								 return done(null,req.body,req.flash('signUpMessage','회원가입성공'));	
		        							 });
		        							 
		        							
	        								
	        						     });
	        						
	        		        	    	      
	        							};
	        						});
	        						
	        					
	        				 
	        			    	});
	        	          });