/**
 * New node file
 */
var paypal = require('paypal-rest-sdk');

exports.paypalCreate = function (req, res) {
 
 var method = req.param('method');
 var sits = req.param('choosen-sits');
 console.log(sits);
 
  var payment = {
    "intent": "sale",
    "payer": {
    },
    "transactions": [{
    	 "item_list": {
             "items": [{
                 "name": "item",
                 "sku": "item",
                 "price": "30",
                 "currency": "USD",
                 "quantity": 1
             }]
         },
      "amount": {
        "currency": req.param('currency'),
        "total": req.param('amount'),
      },
      "description": sits
    }]
  };
 
  if (method === 'paypal') {
    payment.payer.payment_method = 'paypal';
    payment.redirect_urls = {
      "return_url": "http://localhost:3000/paypalExecute",
      "cancel_url": "http://localhost:3000/paypalCancel"
    };
  } else if (method === 'credit_card') {
    var funding_instruments = [
      {
        "credit_card": {
          "type": req.param('type').toLowerCase(),
          "number": req.param('number'),
          "expire_month": req.param('expire_month'),
          "expire_year": req.param('expire_year'),
          "first_name": req.param('first_name'),
          "last_name": req.param('last_name')
        }
      }
    ];
    payment.payer.payment_method = 'credit_card';
    payment.payer.funding_instruments = funding_instruments;
  }
 
  paypal.payment.create(payment, function (error, payment) {
    if (error) {
      console.log(error);
      res.render('error', { 'error': error });
    } else {
      req.session.paymentId = payment.id;
      res.render('paypalCreate', {'payment': payment});
    }
  });
};


exports.paypalExecute = function(req, res){
	  var paymentId = req.session.paymentId;
	  var payerId = req.param('PayerID');
	 
	  var details = { "payer_id": payerId };
	  paypal.payment.execute(paymentId, details, function (error, payment) {
	    if (error) {
	      console.log(error);
	    } else {
	      console.log(payment);
	      res.render('paypalExecute',{'payment':payment});
	    }
	  });
};