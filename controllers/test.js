var dbConfig = config('dbconfig.js');


exports.test = function(req,res){
	dbConfig.getConnection(function(err,connection){
		
	 if (err) {
	      console.error(err.message);
	      return;
	 }
	 connection.execute(
	 "select * from test"
	,
	 function(err,result){
		if(err){
			console.log(err.message);
			return;
		}
		console.log(result.rows);
		res.render('index',{
			rows:result.rows
		});
	 });
	 
	  connection.release(
	    function(err){
	    	if(err){
	    		console.err('relese() callback :'+err.message);
	    		return;
	    	}
	    }
	     
	  );
});
}