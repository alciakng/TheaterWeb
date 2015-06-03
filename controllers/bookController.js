/**
 * New node file
 */
var dbConfig = config('dbconfig.js');
var oracledb = require('oracledb');

//get parameter를 얻어내기 위한 모듈
var url = require('url');


//사용자에게 회원으로 에약할 것인지 비회원으로 예약할건지 물어보는 화면
exports.question = function(req,res){
	res.render('book/question');
}

//reserve movie;
exports.book1_init = function(req,res){
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(
				 "select * from movie"
			    ,
			    []
			    ,
			    {outFormat: oracledb.OBJECT}
			    ,
				 function(err,result){
			    	console.log(result);
					if(err){
						console.log(err.message);
						return;
					}
					res.render('book/book1-init',{
						movies : result.rows
					}); 
					
					connection.release(function(err){
						if(err){
							console.log(err.message);
							return;
						}
					});
					
			     });
	          });
};

//nonmember_init;
exports.book1_nonmemberInit = function(req,res){
	
	//세션에 비회원정보 저장
	req.session.nonmember = req.body;
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(
				 "select * from movie"
			    ,
			    []
			    ,
			    {outFormat: oracledb.OBJECT}
			    ,
				 function(err,result){
			    	console.log(result);
					if(err){
						console.log(err.message);
						return;
					}
					res.render('book/book1-init',{
						movies : result.rows
					}); 
					
					connection.release(function(err){
						if(err){
							console.log(err.message);
							return;
						}
					});
					
			     });
	          });
};

//reserve seat;
exports.book2_seat = function(req,res){
	
	//get parameters
	var url_parts = url.parse(req.url, true);
	var prevData = url_parts.query;
	console.log(prevData);
	
	var seat_select_sql ="select * from SEAT,PERFORMANCE_SEAT where SEAT.SEATCODE=PERFORMANCE_SEAT.SEATCODE and SEAT.SCREENCODE=:screencode and PERFORMANCE_SEAT.TIMECODE=:timecode order by SEAT.SEATROW,LENGTH(SEAT.SEATCOL),SEAT.SEATCOL";
	
	//bind variables
	var bindvars ={
			screencode:prevData.choosen_screen,
			timecode:prevData.choosen_screen+prevData.choosen_date+prevData.choosen_count
	};
	
	console.log(bindvars.timecode);
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 //스크린코드가 :screencode이고 seatrow와 seatcol에 대해 오름차순으로 정렬하여 출력하는 쿼리.
				 connection.execute(
				 seat_select_sql,
				 bindvars
			    ,
			    {outFormat: oracledb.OBJECT,maxRows:1000}
			    ,
				 function(err,result){
			    	//console.log(result);
					if(err){
						
						console.log(err.message);
						return;
					}
					console.log(result);
					
					//result array mapping
					var mappedArr=new Array();
					var tempArr=new Array();
					if(result.rows.length!=0) var seatrow =result.rows[0].SEATROW;
					
					result.rows.forEach(function(element,index,array){
						
						if(seatrow==element.SEATROW) tempArr.push(element);
						else {
							mappedArr.push(tempArr);
							seatrow =element.SEATROW;
							tempArr=[];
							tempArr.push(element);
						}
					});
					mappedArr.push(tempArr);
					
					
					res.render('book/book2-seat',{
						seatRows : mappedArr,
						prevData : prevData
					}); 
					
					
					connection.release(function(err){
						if(err){
							console.log(err.message);
							return;
						}
					});
					
			     });
	          });
};

exports.book3_mileage = function(req,res){
	
	var url_parts = url.parse(req.url, true);
	var prevData = url_parts.query;
	console.log(prevData);
	
	res.render('book/book3-mileage.html',{
		prevData:prevData,
		mileage:req.user.MILEAGE
	});
}

/*buy a ticket(총 금액을 마일리지로만 결제하는 경우)
마일리지로만 결제하지 않는 경우에는 paypalCreate가 동작한다.
*/
exports.book3_buy = function(req,res){

	 //get parameters and put into reservaionInfo
    var url_parts = url.parse(req.url, true);
	var reservationInfo = url_parts.query; 
	req.session.reservationInfo = reservationInfo;
	
	res.render('book/book3-buy.html',{'reservationInfo':reservationInfo});
};

exports.book4_final = function(req,res){
	var reservationInfo = req.session.reservationInfo; 
	
	res.render('book/book4-final',{'reservationInfo':reservationInfo})
} 