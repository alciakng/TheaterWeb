/**
 * New node file
 */
var dbConfig = config('dbconfig.js');
var oracledb = require('oracledb');
var fs = require('fs');

exports.showPage = function(req,res){
	res.render('addMovie');
}

exports.selectValue =function(req,res){
	oracledb.getConnection(dbConfig,
			function(err,connection){
		connection.execute("select * from movie",
		    function(err,result){
				if(err){
					console.log(err.message);
					return;
				}
				console.log(result);
			}
			
		);
	});
};

//add movie
exports.addMovie = function(req,res){
	//location of movie image;
	
	
	fs.readFile(req.files.image.path,function(error,data){
		var imagePath = 'c:\\eclipseWorkspace\\TheaterWeb\\public\\image\\'+req.files.image.name;
		
		fs.writeFile(imagePath,data,function(error){
			if(error){
				throw error;
			}
		})
	});
	
	oracledb.getConnection(dbConfig,
		function(err,connection){
				
			 if (err) {
			      console.error(err.message);
			      return;
			 }
			 console.log(req.body);
			 connection.execute(
			 "insert into Movie VALUES(:MOVIECODE,:NAME,:GENRE,:RUNNINGTIME,:DIRECTOR,:SUMMARY,:IMAGE,:RATING,:COMPANY)"
		    ,[req.body.moviecode,req.body.name,req.body.genre,req.body.runningtime,req.body.director,req.body.summary,req.files.image.name,req.body.rating,req.body.company]
		    ,
			 function(err){
				if(err){
					console.log(err.message);
					return;
				}
				connection.commit(function(err){
					if(err){
						console.log(err.message);
						return;
					}
					res.render('addMovie');
				 })
		     });
          });
}