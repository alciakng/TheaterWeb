/**
 * New node file
 */

var dbConfig = config('dbconfig.js');
var oracledb = require('oracledb');

//show index page;
exports.index = function(req,res){
	

	var select_movie_orderby_rating_score = "select to_char(avg(r.score),'fm90.0') as avgscore ,r.moviecode,m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.image,to_char(m.opendate, 'yy-mm-dd') as open_date "
										   +"from rating r, movie m "
										   +"where r.moviecode =m.moviecode "
										   +"group by r.moviecode,m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.image,m.opendate "
										   +"order by avg(r.score) desc";
	
	var select_current_open_movie = "select * from movie";
		
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 
				 connection.execute(select_current_open_movie,[],{outFormat:oracledb.OBJECT,maxRows:8},function(err,result1){
					 if (err) {
						  console.log("여긴가");
					      console.error(err.message);
					      return;
					 }
					 connection.execute(select_movie_orderby_rating_score,[],{outFormat:oracledb.OBJECT,maxRows:6},function(err,result2){
						 if (err) {
							  console.log("여긴가2");
						      console.error(err.message);
						      return;
						 	}
						 connection.release(function(err){
							  if (err) {  
								  console.log("여긴가3");
						      console.error(err.message);
						      return;
							 }
							  console.log(result1.rows);
							  res.render('index/index',{todayMovies:result2.rows,currentMovies:result1.rows});
						 });
					 })
					 
					
					 
				 })	 
	});
};


exports.contact = function(req,res){
	res.render('index/contact');
}


exports.screen = function(req,res){
	
	var select_screen = "select * from screeninfo";

	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(select_screen,[],{outFormat:oracledb.OBJECT},function(err,result){
					 if (err) {
						  console.log("스크린 불러오기 에러");
					      console.error(err.message);
					      return;
					 }
					 connection.release(function(err){
						 if(err){
							 console.log("스크린 불러올때 릴리스 에러");
							 console.err(err.messge);
							 return; 
						 }

						 res.render('index/screen',{screens: result.rows});
					 });
					 
					 
				 });
	});

}


exports.checkReservationPage = function(req,res){
	res.render('index/checkReservation');
}

exports.checkReservation = function(req,res){
	
	var check_reservation = "select to_char(time.moviedate, 'yy-mm-dd') as moviedate,movie.moviecode,movie.name,movie.image,movie.runningtime,booking.bookingcode,booking.screencode,booking.totalprice,booking.seatcount,booked_seats.seatcode,time.starttime from booking,booked_seats,movie,time where booking.bookingcode =booked_seats.bookingcode and movie.moviecode=booking.moviecode and booking.timecode= time.timecode and booking.phonenumber=:phonenumber"
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(check_reservation,[req.body.phone_number],{outFormat:oracledb.OBJECT},function(err,result){
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