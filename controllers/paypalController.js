/**
 * New node file
 */
var paypal = require('paypal-rest-sdk');
var url =require('url');
var dbConfig = config('dbconfig.js');
var oracledb = require('oracledb');

//결제생성모듈
exports.paypalCreate = function (req, res) {
 //paypal method방법(credit_card or paypal)
 var method = req.param('method');

 //get parameters and put into reservaionInfo
 var url_parts = url.parse(req.url, true,true);
 var reservationInfo = url_parts.query; 

 var payment = {
    "intent": "sale",
    "payer": {
    },
    "transactions": [{
    	 "item_list": {
             "items": [{
            	 name:'좌석',
            	 price:reservationInfo.screen_cost,
            	 currency:'USD',
            	 quantity:reservationInfo.choosen_number
             }]
         },
      "amount": {
        "currency": reservationInfo.currency,
        "total": (req.user? reservationInfo.discount_cost : reservationInfo.total_cost-reservationInfo.early_morning_fee),
      },
      "description": reservationInfo.choosen_sits.substr(0,reservationInfo.choosen_sits.length-2)
    }]
  };
 

 
 //회원인 경우 마일리지를 사용할경우에 정보대입
 if(req.user&&reservationInfo.using_mileage!=0) payment.transactions[0].item_list.items.push(new Item('마일리지사용',-reservationInfo.using_mileage,'USD',1));
 
 //조조할인일 경우 정보대입
 if(reservationInfo.early_morning_fee!=0) payment.transactions[0].item_list.items.push(new Item('조조할인',-reservationInfo.early_morning_fee,'USD',1))
  
  console.log(payment.transactions[0].item_list.items);
  if (method === 'paypal') {
    payment.payer.payment_method = 'paypal';
    payment.redirect_urls = {
      "return_url": req.protocol + "://" + req.get('host')+"/paypalExecute",
      "cancel_url": req.protocol + "://" + req.get('host')+"/paypalCancel"
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
 
  paypal.payment.create(payment, function (error, payment){
    if (error) {
      console.log(error);
      res.render('error', { 'error': error });
    } else {
      req.session.paymentId = payment.id;
      req.session.reservationInfo = reservationInfo;
      
      res.render('book/book3-buy', {'payment': payment,'reservationInfo':reservationInfo});
    }
  });
  
};

//결제진행 모듈.
exports.paypalExecute = function(req, res){
	var paymentId = req.session.paymentId;
	var reservationInfo = req.session.reservationInfo;
	var payerId = req.param('PayerID');
	var details = { "payer_id": payerId };
	
	//trim해서 문자열의 양쪽 공백을 없애준 후 배열생성.
	var seats = reservationInfo.choosen_sits.substr(0,reservationInfo.choosen_sits.length-2);
	console.log(seats);
	
	var bindvars = {
			  p_seats: seats,
			  p_email : (req.user? req.user.EMAIL : null),
			  p_class : (req.user? req.user.CLASS : null),
			  p_phonenumber : (req.user? null : req.session.nonmember.phone_number),
			  p_name : (req.user? req.user.NAME : req.session.nonmember.name),
			  p_bookingcode : paymentId,
			  p_timecode : reservationInfo.choosen_screen+reservationInfo.choosen_date+reservationInfo.choosen_count,
			  p_screencode :reservationInfo.choosen_screen,
			  p_moviecode : reservationInfo.choosen_moviecode,
			  p_totalprice : (req.user? reservationInfo.discount_cost :reservationInfo.total_cost),
			  p_seatcount : reservationInfo.choosen_number
			}
	
	var BIGINBLOCK = "DECLARE "
                    +"p_seatcodes SEATCODES; "
                    +"s_seatcodes varchar2(300); "
                    +"BEGIN " 
                    +"s_seatcodes:= :p_seats;"
                    +"SELECT REGEXP_SUBSTR(s_seatcodes, '[^,$]+', 1, LEVEL ) AS 검증항목 "
                    +"BULK collect into p_seatcodes "
                    +"FROM DUAL "
                    +"CONNECT BY REGEXP_SUBSTR(s_seatcodes, '[^,$]+', 1, LEVEL ) IS NOT NULL; "
                    +"RESERVEPROC(:p_email,:p_class,:p_phonenumber,:p_name,:p_bookingcode,:p_timecode,:p_screencode,:p_moviecode,:p_totalprice,:p_seatcount,p_seatcodes); "
                    +"END; "

	//table query
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err){
				      console.error(err.message);
				      return;
				 }
				 connection.execute(BIGINBLOCK,bindvars,function(err,result){
					 if(err){
						 console.log("예약 프로시저 에러");
						 console.log(err.message);
						 return ;
					 }
					 console.log("예약 프로시저가 정상적으로 실행되었음.");  // 1
					 
			     }); 
	  });
	
	  paypal.payment.execute(paymentId, details, function (error, payment) {
	    if (error) {
	      console.log(error);
	    } else {
	      console.log(payment);
	      res.render('book/book4-final',{'payment':payment,'reservationInfo':reservationInfo});
	    }
	  });
};



function Item(name, price, currency,quantity ){

	this.name = name;
	this.price = price;
	this.currency = currency;
	this.quantity = quantity;
}
