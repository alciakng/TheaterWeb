/**
 * New node file
 */

var paypalConfig = config('config.json');

module.exports = function(paypal){
	  paypal.configure(paypalConfig.paypal.api);
};




