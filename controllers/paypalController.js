/**
 * New node file
 */
var paypal = require('paypal-rest-sdk');
var url =require('url');
var dbConfig = config('dbconfig.js');
var oracledb = require('oracledb');


exports.paypalCreate = function (req, res) {
 //paypal method방법(credit_card or paypal)
 var method = req.param('method');
 //좌석들
 var sits = req.param('choosen_sits');
 //싼좌석의 개수
 var numberOfCheap = req.param('choosen_number__cheap');
 //중간가격 좌석의 개수
 var numberOfMiddle = req.param('choosen_number__middle');
 //비싼가격 좌석의 개수 
 var numberOfExpansive = req.param('choosen_number__expansive');
 //영화
 var movie = req.param('choosen_movie');
 //스크린
 var screen = req.param('choosen_screen');
 //시간
 var time = req.param('choosen_time');
 
 //get parameters and put into reservaionInfo
 var url_parts = url.parse(req.url, true);
 var reservationInfo = url_parts.query;
 console.log(reservationInfo);
 
 var payment = {
    "intent": "sale",
    "payer": {
    },
    "transactions": [{
    	 "item_list": {
             "items": []
         },
      "amount": {
        "currency": req.param('currency'),
        "total": req.param('amount'),
      },
      "description": sits
    }]
  };
 
 
  //items object를 만든다.
  var items= new Array();
  if(numberOfCheap!=0)  items.push(new Item('10$좌석','10',numberOfCheap));
  if(numberOfMiddle!=0)  items.push(new Item('20$좌석','20',numberOfMiddle));
  if(numberOfExpansive!=0) items.push(new Item('30$좌석','30',numberOfExpansive));
  payment.transactions[0].item_list.items=items;
  
  	
  console.log(payment.transactions[0].item_list.items);
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


exports.paypalExecute = function(req, res){
	var paymentId = req.session.paymentId;
	var reservationInfo = req.session.reservationInfo;
	var payerId = req.param('PayerID');
	var details = { "payer_id": payerId };
	  
  	var booking_insert = "INSERT INTO BOOKING VALUES ( :bookingcode, :email, :timecode,:screencode,:moviecode,:totalprice,:cheapseatcount,:middleseatcount,:expansiveseatcount)";
	var booked_seats_insert ="INSERT INTO BOOKED_SEATS VALUES(:bookingcode,:seatcode)"; 
	var performance_seat_update ="UPDATE PERFORMANCE_SEAT SET SEATSTATUS=1 WHERE SEATCODE :seatcode and TIMECODE :timecode";
  	
  	
	oracledb.getConnection(dbConfig,
			function(err,connection){
				 if (err) {
				      console.error(err.message);
				      return;
				 }
				 connection.execute(booking_insert,[paymentId,req.user.email,reservationInfo],{outFormat: oracledb.OBJECT},
					function(err,user){
				    	console.log(user);
						if(err){
							
							return done(err,req.flash('signUpMessage','인터넷 연결을 확인하세요'));
						}
						if(user.rows.length>0){
							
							return done(null,null,req.flash('signUpMessage','이미 존재하는 이메일 입니다..'));
						}
						else{
							console.log(req.body);
							connection.execute(insert,req.body,function(err,result){
								
								if(err){
									console.log("삽입에러");
		        					return done(null,null,req.flash('signUpMessage','db점검 중 입니다..'));
		        				}
								connection.commit(function(err){
									if(err){
										console.log("삽입시 커밋에러");
										console.log(err.message);
										return;
									}
								console.log(result);
									  return done(null,req.body,req.flash('signUpMessage','회원가입성공'));
								 })
		        	    	      
							});
						}
						
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

//make Item
function Item(name,price,quantity){
	this.name = name;
	this.price = price;
	this.currency = 'USD';
	this.quantity = quantity;
}

