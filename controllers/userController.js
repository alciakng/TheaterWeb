/**
 * New node file
 */

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