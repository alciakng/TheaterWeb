/**
 * New node file
 */

var testController = controllers('test.js');

module.exports = function(app){
	
app.get('/', testController.test);

};