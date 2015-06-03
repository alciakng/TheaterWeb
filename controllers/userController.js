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
//logout
exports.logout = function(req,res){
	    req.logout();
	    res.redirect('/');
}

//회원가입에 성공했을 때
exports.successSignUp = function(req,res){
	req.logout();
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

//예매목록 가져오기.
exports.bookingList = function(req,res){
	console.log("예매목록 불러오기");
	var select_from_booking_and_bookedseats = "select to_char(time.moviedate, 'yy-mm-dd') as moviedate,movie.moviecode,movie.name,movie.image,movie.runningtime,booking.bookingcode,booking.screencode,booking.totalprice,booking.seatcount,booked_seats.seatcode,time.starttime from booking,booked_seats,movie,time where booking.bookingcode =booked_seats.bookingcode and movie.moviecode=booking.moviecode and booking.timecode= time.timecode and email=:email"
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(select_from_booking_and_bookedseats,[req.user.EMAIL],{outFormat:oracledb.OBJECT},function(err,result){
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
						 
						//make mapped Array of bookings; 
						 var mappedArr=new Array();
						 var tempArr=new Array();
						 if(result.rows.length!=0) var bookingcode =result.rows[0].BOOKINGCODE;
						 console.log(bookingcode);
							
							result.rows.forEach(function(element,index,array){
								
								if(bookingcode==element.BOOKINGCODE) tempArr.push(element);
								else {
									mappedArr.push(tempArr);
									bookingcode =element.BOOKINGCODE;
									tempArr=[];
									tempArr.push(element);
								}
							});
							mappedArr.push(tempArr);
							console.log(mappedArr);
					
						 
						 res.render('user/bookingList',{bookingLists: mappedArr});
					 });
					 
					 
				 });
	});
	
}


//예약취소
exports.cancelBooking =function(req,res){
	
	console.log('예약 취소하기');
	var cancel_booking = 'begin cancelreserveproc(:email,:class,:bookingcode,:totalprice);END;';
	
	var bindvars ={
			email : req.user.EMAIL,
			class : req.user.CLASS,
			bookingcode : req.param('bookingcode'),
			totalprice : req.param('totalprice')
	}
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(cancel_booking,bindvars,function(err,result){
					if(err){
						console.log("예약취소 에러");
						console.error(err.message);
						return;
					} 
						connection.release(function(err){
							if(err){
								console.log("예약취소 코넥션 릴리스 에러");
								console.error(err.message);
								return;
							}
							console.log("에약취소 프로시저가 정상적으로 실행되었음.")
							res.redirect('user/bookingList');
						})
	
				 });
	});
	
	
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


//회원탈퇴
exports.withdraw = function(req,res){
	
	console.log('회원탈퇴 시도');
	var withdraw_from_member = "delete from member where email=:email";
	
	var bindvar = {email : req.user.EMAIL};
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(withdraw_from_member,bindvar,{autoCommit:true},function(err,result){
					 if (err) {
						  console.log("회원탈퇴 에러");
					      console.error(err.message);
					      return;
					 }
					 connection.release(function(err){
						 if(err){
							 console.log("회원 탈퇴할때 릴리스 에러");
							 console.err(err.messge);
							 return; 
						 }
						 console.log('회원탈퇴 성공');
						 req.logout();
						 res.redirect('/');
					 });
					 
					 
				 });
	});
	
	
}


//유저정보
exports.info =function(req,res){
	
	var select_info = "select to_char(birth, 'yy-mm-dd') as birth,name,sex,mileage,class from member where email= :email";
	
	var bindvar = { email : req.user.EMAIL};
	
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(select_info,bindvar,{outFormat:oracledb.OBJECT},function(err,result){
					 if (err) {
						  console.log("유저정보 받아오기 에러");
					      console.error(err.message);
					      return;
					 }
					 connection.release(function(err){
						 if(err){
							 console.log("유저정보 받아올 때 릴리스 에러");
							 console.err(err.messge);
							 return; 
						 }
						 console.log('유저정보 불러오기 성공');
						 console.log(result.rows);
						 res.render('user/info',{
							 info : result.rows
						 });
					 });
					 
					 
				 });
	});
	
	
	
}
