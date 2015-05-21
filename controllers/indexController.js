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
				 
				 connection.execute(select_current_open_movie,[],{outFormat:oracledb.OBJECT},function(err,result1){
					 if (err) {
						  console.log("여긴가");
					      console.error(err.message);
					      return;
					 }
					 connection.execute(select_movie_orderby_rating_score,[],{outFormat:oracledb.OBJECT,maxRows:8},function(err,result2){
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
							  console.log(result1.rows);
							  res.render('index',{todayMovies:result2.rows,currentMovies:result1.rows});
						 });
					 })
					 
					
					 
				 })	 
	});
};


exports.contact = function(req,res){
	
	res.render('contact');
}