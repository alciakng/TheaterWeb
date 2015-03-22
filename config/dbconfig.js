var oracledb = require('oracledb');
var connectionPool;

oracledb.createPool(
 {
	 user : "JH",
	 password : "JH",
	 connectString : "localhost/XE",
	 poolMax : 44,
	 poolMin : 2,
	 poolIncrement:5,
	 poolTimeout : 4
 },function(err,pool){
	 if (err) {
	      console.error('createPool() callback: ' + err.message);
	      return;
	  }
	connectionPool = pool;
});

 
exports.getConnection = function(cb){
	connectionPool.getConnection(cb);
}