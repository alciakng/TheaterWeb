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

//login
module.exports = new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req,email, password, done) { // callback with email and password from our form
    	
    	var sql = "select * from member where email = :email";
    	
    	oracledb.getConnection(dbConfig,
    			function(err,connection){
    				 if (err) {
    				      console.error(err.message);
    				      return;
    				 }
    				 connection.execute(sql,[email],{outFormat: oracledb.OBJECT},
    					function(err,user){
    				    	console.log(user);
    						if(err){
    							console.log(err.message);
    							return done(err); 
    						}
    						if(user.rows.length==0){
    							return done(null, false, req.flash('loginMessage', '이메일을 잘못 입력하셨습니다.'));
    						}
    						if(user.rows[0].PW!=password){
    			    	    	 return done(null,false,req.flash('loginMessage', '비밀번호를 잘못 입력하셨습니다.'))
    			    	    }
    						return done(null,user.rows[0],req.flash('loginMessage',user.rows[0].NAME+'님 환영합니다.'));
    			    	});
    	          });
    	/*
    	User.findOne({email:email},function(err,user){
    		 if (err) { return done(err); }
    	     if (!user) {
    	        return done(null, false, req.flash('loginMessage', '이메일을 잘못 입력하셨습니다.'));
    	     }
    	     if(!user.authenticate(password)){
    	    	 return done(null,false,req.flash('loginMessage', '비밀번호를 잘못 입력하셨습니다.'))
    	     }
    	     return done(null,user,req.flash('loginMessage',user.alias+'님 환영합니다.'));
    	});
    	*/
    	
		
    });
	
	
	