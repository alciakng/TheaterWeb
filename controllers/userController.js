/**
 * New node file
 */

var dbConfig = config('dbconfig.js');
var oracledb = require('oracledb');

exports.showPage = function(req,res){
	res.render('addMovie');
}

//Load SignUp Page 
exports.signUp = function(req,res){
	res.render("user/signUp",{signUpMessage : req.flash('signUpMessage')});
}

//Load Login Page
exports.login = function(req,res){
	res.render("user/login",{loginMessage : req.flash('loginMessage')});
}

//회원가입에 성공했을 때
exports.successSignUp = function(req,res){
	console.log("회원가입 성공");
	res.send({signUpMessage : req.flash('signUpMessage'),
		matching:"success"});
}

//회원가입에 실패했을 때
exports.failSignUp = function(req,res){
	console.log("회원가입 실패");
	res.send({signUpMessage : req.flash('signUpMessage'),
		matching:"fail"});
}

//로그인에 성공했을 때
exports.successLogin = function(req,res){
	console.log("로그인 성공");
	res.send({loginMessage : req.flash('loginMessage'),
	matching : "success"});
}

//로그인에 실패했을 때
exports.failLogin = function(req,res){
	console.log("로그인 실패");
	res.send({loginMessage : req.flash('loginMessage'),matching:"fail"});	
}


//워치리스트 불러오기 
exports.getWatchList = function(req,res){
	console.log("워치리스트에 불러오기");
	
	var select_from_watchlist = "select moviecode,name,image from movie where moviecode IN (select moviecode from watchlist where email =:useremail)"
	
		
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(select_from_watchlist,[req.user.EMAIL],{outFormat:oracledb.OBJECT},function(err,result){
					 if (err) {
						  console.log("워치리스트 불러오기 에러");
					      console.error(err.message);
					      return;
					 }
					 
					 connection.release(function(err){
						 if(err){
							 console.log("워치리스트 불러올때 릴리스 에러");
							 console.err(err.messge);
							 return; 
						 }
						 console.log(result.rows);
						 res.render('user/watchlist',{watchlists: result.rows});
					 });
					 
					 
				 });
	});
	
}


//워치리스트에 담기
exports.addWatchList = function(req,res){
	console.log("워치리스트에 추가");
	
	var call_watchlist_proc = "BEGIN WATCHLISTPROC(:email,:moviecode);END;";
	
	var bindvars ={
			email : req.user.EMAIL,
			moviecode : req.param('moviecode')
	};
		
	console.log(req.param('moviecode'));	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(call_watchlist_proc,bindvars,function(err,result){
					if(err){
						console.log("워치리스트 추가 에러");
						console.error(err.message);
						return;
					} 
						connection.release(function(err){
							if(err){
								console.log("워치리스트 추가 코넥션 릴리스 에러");
								console.error(err.message);
								return;
							}
							res.redirect('movie/list');
						})
	
				 });
	});
};