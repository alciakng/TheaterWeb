/**
 * New node file
 */
var dbConfig = config('dbconfig.js');
var oracledb = require('oracledb');
//get parameter를 얻어내기 위한 모듈
var url = require('url');




//get time Of Movie
exports.getTimeOfMovie = function(req,res){
	var moviecode =req.param('moviecode');
	var date =req.param('date');
	
	console.log(moviecode);
	console.log(date);
	var sql = "select * from time where moviecode =:moviecode and moviedate=to_date(:moviedate,'yy-mm-dd') order by SCREENCODE";
	
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
	var keyword = req.param('search__text')+'%';
	
	var sql = "select * from movie where name like :keyword1 or director like :keyword2 or genre like :keyword3 ";
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(sql,[keyword,keyword,keyword],{outFormat: oracledb.OBJECT},
					function(err,result){
				    	console.log(result);
						if(err){
							console.log(err.message);
							return;
						}
						connection.release(function(err){
							if(err){
								console.log(err.message);
								return;
							}
							res.render('movie/listOfMovie',{
								movies : result.rows
							}); 
						})
						
						
			    	});
	          });
}

//getMovieInfo
exports.getMovieInfo =function(req,res){
	
	var moviecode = req.param('moviecode');
	var select_movie_info = "select to_char(avg(r.score),'fm90.0') as avgscore ,count(r.moviecode) as votes,r.moviecode,m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.image,m.summary,m.actors,to_char(m.opendate, 'yy-mm-dd') as open_date from movie m,rating r where m.moviecode=r.moviecode and m.moviecode =:moviecode group by r.moviecode,m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.image,m.opendate,m.summary,m.actors";
	var select_reply = "select m.name,m.password,r.reply from reply r,member m where r.email=m.email and r.moviecode=:moviecode";
	
	
	var bindvars = {
			moviecode : moviecode
	};
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(select_movie_info,bindvars,{outFormat:oracledb.OBJECT},function(err,result1){
					 if(err){
						 console.error(err.message);
						 return;
					 }
					 
					 connection.execute(select_reply,bindvars,{outFormat:oracledb.OBJECT},function(err,result2){
						 if(err){
							 console.error(err.message);
							 return;
						 }
						 
						 connection.release(function(err){
							 if(err){
								 console.error(err.message);
								 return;
							 }
							 console.log(result1.rows+result2.rows);
							 res.render('movie/movieInfo',{movieInfo:result1.rows[0],replys:result2.rows}); 
						 });
						 
					 });
					 
					
				 })
	})
}

//get Rating
exports.getRating = function(req,res){
	
	var select_movie_orderby_rating_score = "select to_char(avg(r.score),'fm90.0') as avgscore ,count(r.moviecode) as votes,r.moviecode,m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.image,to_char(m.opendate, 'yy-mm-dd') as open_date "
		   +"from rating r, movie m "
		   +"where r.moviecode =m.moviecode "
		   +"group by r.moviecode,m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.image,m.opendate "
		   +"order by avg(r.score) desc";
	
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 
			
					 connection.execute(select_movie_orderby_rating_score,[],{outFormat:oracledb.OBJECT},function(err,result){
						 if (err) {
							  console.log("여긴가2");
						      console.error(err.message);
						      return;
						 	}
						 connection.release(function(err){
							  if (err) {
						      console.error(err.message);
						      return;
							 }
							  console.log(result.rows);
							  res.render('movie/ratinglist',{ratinglist:result.rows});
						 });
					 })
	});
	
};


//post Rating
exports.postRating = function(req,res){
	
	var score = req.body.score;
	var moviecode =req.body.moviecode;
	
	var insert_score_into_rating ="insert into rating values(SEQ_RATING.NEXTVAL,:moviecode,:score)";
	
	var bindvars = {
		moviecode :moviecode,
		score : score
	};
	
	console.log(bindvars);
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 if (req.isAuthenticated()) {
				  
					 connection.execute(insert_score_into_rating,bindvars,{autoCommit:true},function(err,result){
						 	if(err){
						 		console.error(err.message);
						 		return;
						 	}
						 	connection.release(function(err){
						 		if(err){
							 		console.error(err.message);
							 		return;
						 		}
						 		
						 		res.send({isLogedIn : true});
						 	});
						 
						 
						 });
				 }
				 else res.send({isLogedIn : false});
				 }
			)
};


//reply
exports.reply = function(req,res){
	var reply = req.body.reply;
	var moviecode =req.body.moviecode;
	
	var insert_into_reply = "insert into reply values(SEQ_REPLY.NEXTVAL,:moviecode,:email,:reply)";
	
	var bindvars = {
			moviecode : moviecode,
			email : req.user.EMAIL,
			reply : reply
	}
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 
				 connection.execute(insert_into_reply,bindvars,{autoCommit:true},function(err,result){
					 if (err) {
					      console.error(err.message);
					      return;
					 }
					 
					 connection.release(function(err){
						 if (err) {
						      console.error(err.message);
						      return;
						 }
						 res.redirect('/movie/info?moviecode='+moviecode);
						 
					 });
					 
					 
				 });
				 
	});
}



//show list of movie;
exports.showListOfMovie = function(req,res){

	var genre =(req.param('genre')!=undefined? req.param("genre")+"%" :"%");
	
	
	console.log(genre);
	
	
	var bindvars = {
			bind_genre : genre
	}
	
	var select_movie_orderby_parameter = "select to_char(avg(r.score),'fm90.0') as avgscore ,count(r.moviecode) as votes,r.moviecode,m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.actors,m.image, m.summary, to_char(m.opendate, 'yy-mm-dd') as open_date  "
		   +"from rating r, movie m "
		   +"where r.moviecode =m.moviecode "
		   +"and genre like :bind_genre "
		   +"group by r.moviecode,m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.actors,m.image,m.opendate,m.summary "
		   +"order by ";
	
	select_movie_orderby_parameter+=(req.param('orderBy')=='OPENDATE'? "m.opendate DESC " : "avg(r.score) DESC")
	
	
	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(select_movie_orderby_parameter,bindvars,{outFormat: oracledb.OBJECT},
					function(err,result){
				    	console.log(result);
						if(err){
							console.log(err.message);
							return;
						}
					
						connection.release(function(err){
							if(err){
								console.log(err.message);
								return;
							}
							res.render('movie/listOfMovie',{
								movies : result.rows
							}); 
						});
						
			    	});
	          });
}
