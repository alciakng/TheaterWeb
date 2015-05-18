/**
 * New node file
 */
var oracledb = require('oracledb');
var dbConfig = config('dbconfig');



exports.getConnection = function(cb){
	oracledb.getConnection(dbConfig,cb);
};

exports.doRelease = function(connection){
	connection.release(
		function(err)
	      {
	        console.error(err.message);
	        return;
	 });
}







