/**
 * New node file
 */
var dbConfig = config('dbconfig.js');
var oracledb = require('oracledb');


//show index page;
exports.index = function(req,res){

	res.render('index');
}

//get time Of Movie
exports.getTimeOfMovie = function(req,res){
	var moviecode =req.param('moviecode');
	var date =req.param('date');
	
	console.log(moviecode);
	console.log(date);
	var sql = "select * from time where moviecode =:moviecode and moviedate=to_date(:moviedate,'yy/mm/dd') order by SCREENCODE";
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(sql,[moviecode,date],{outFormat: oracledb.OBJECT},
					function(err,result){
				    	console.log(result);
						if(err){
							console.log(err.message);
							return;
						}
						
						//make mapped Array of times; 
						var mappedArr=new Array();
						var tempArr=new Array();
						if(result.rows.length!=0) var screencode =result.rows[0].SCREENCODE;
						console.log(screencode);
						
						result.rows.forEach(function(element,index,array){
							
							if(screencode==element.SCREENCODE) tempArr.push(element);
							else {
								mappedArr.push(tempArr);
								screencode =element.SCREENCODE;
								tempArr=[];
								tempArr.push(element);
							}
						});
						mappedArr.push(tempArr);
						console.log(mappedArr);
						res.send(mappedArr);
			    	});
	          });
}

//search Movie
exports.searchMovie = function(req,res){
	var keyword = req.param('search__text');
	
	var sql = "select * from movie where name like : keyword1 or director like : keyword2 ";
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(sql,[keyword,keyword],{outFormat: oracledb.OBJECT},
					function(err,result){
				    	console.log(result);
						if(err){
							console.log(err.message);
							return;
						}
						res.render('listOfMovie',{
							movies : result.rows
						}); 
			    	});
	          });
}

exports.test =function(req,res){
	res.render('test');
}
//show list of movie;
exports.showListOfMovie = function(req,res){
	console.log(req.param("genre"));
	console.log(req.param("orderBy"));
	var genre =(req.param('genre')!=undefined? req.param("genre")+"%" :"%");
	var orderBy = (req.param('orderBy')!=undefined? req.param("orderBy") : "RATING");
	
	console.log(genre);
	console.log(orderBy);
	
	var sql = "select NAME,GENRE,RUNNINGTIME,DIRECTOR,RATING,COMPANY,COUNTRY,ACTORS,IMAGE,SUMMARY,to_char(OPENDATE, 'yy/mm/dd') as OPENDATE,MOVIECODE from movie where genre like :genre order by :orderBy DESC"
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(sql,[genre,orderBy],{outFormat: oracledb.OBJECT},
					function(err,result){
				    	console.log(result);
						if(err){
							console.log(err.message);
							return;
						}
						res.render('listOfMovie',{
							movies : result.rows
						}); 
			    	});
	          });
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
					res.render('book1-init',{
						movies : result.rows
					}); 
			     });
	          });
};

//reserve seat;
exports.book2_seat = function(req,res){
	var screen = req.param('screen');
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 //스크린코드가 :screencode이고 seatrow와 seatcol에 대해 오름차순으로 정렬하여 출력하는 쿼리.
				 connection.execute(
				 "select * from seat where screencode=:screencode order by SEATROW,LENGTH(SEATCOL),SEATCOL",
			    [screen]
			    ,
			    {outFormat: oracledb.OBJECT}
			    ,
				 function(err,result){
			    	console.log(result);
					if(err){
						console.log(err.message);
						return;
					}
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
					console.log(mappedArr);
					res.render('book2-seat',{
						seatRows : mappedArr
					}); 
			     });
	          });
};

//buy a ticket
exports.book3_buy = function(req,res){
	res.render('book3-buy.html');
};

exports.book4_final = function(req,res){
	res.render('book4-final'.html)
} 