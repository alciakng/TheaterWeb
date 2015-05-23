
var indexController = controllers('indexController.js');
var superController = controllers('superController.js');
var movieController = controllers('movieController.js');
var bookController = controllers('bookController.js');
var userController = controllers('userController.js');
var paypalController = controllers('paypalController.js');

//auth-middleware
var auth = require('./middlewares/auth.js');

module.exports = function(app,passport){
	
	
	
	//movie-router
		app.get('/movie/add', superController.showPage);
		app.post('/movie/add',superController.addMovie);
		app.get('/movie/list',movieController.showListOfMovie);
		app.get('/movie/search',movieController.searchMovie);
		app.get('/movie/time',movieController.getTimeOfMovie);
		app.get('/movie/info',movieController.getMovieInfo);
		app.get('/movie/getRating',movieController.getRating);
		app.post('/movie/postRating',movieController.postRating);
		app.post('/movie/reply',auth.requiresLogin,movieController.reply);
		
	
	//booking-router
		app.get('/book/question',bookController.question);
		app.post('/book/nonmemberInit',bookController.book1_nonmemberInit);
		app.get('/book/init',auth.bookingRequiresLogin,bookController.book1_init)
		app.get('/book/seat',bookController.book2_seat);
		app.get('/book/mileage',bookController.book3_mileage);
		app.get('/book/buy',bookController.book3_buy);
		app.get('/book/final',bookController.book4_final);
	
	//user-router
		//load signup page
		app.get('/signUp',userController.signUp);
		//load login page
		app.get('/login',userController.login);
		//local-signUp
		app.post('/signUp',passport.authenticate('local-signup',{
	        successRedirect:'/successSignUp',	
	        failureRedirect:'/failSignUp',
	        failureFlash:true
	    }));
		//local-login
		app.post('/login',passport.authenticate('local-login',{
		    successRedirect:'/successLogin',
		    failureRedirect:'/failLogin',
		    failureFlash:true
		}));
	    //회원가입에 성공했을 때
	    app.get('/successSignUp',userController.successSignUp);
		//회원가입에 실패했을 때 
		app.get('/failSignUp',userController.failSignUp);
		//로그인에 성공했을 때
		app.get('/successLogin',userController.successLogin);
		//로그인에 실패했을 때
		app.get('/failLogin',userController.failLogin);
		//facebook-auth
		app.get('/auth/facebook', passport.authenticate('facebook',{scope:['email','user_birthday'], display: 'popup' }));
		//facebook-auth-callback
		app.get('/auth/facebook/callback',
		    passport.authenticate('facebook', { successRedirect: '/',
		        failureRedirect: '/login' }));
		
		app.get('/logout', function(req, res){
		    req.logout();
		    res.redirect('/');
		});
		app.get('/auth/twitter', passport.authenticate('twitter'));
		app.get('/auth/twitter/callback', 
			passport.authenticate('twitter', { successRedirect: '/',
		                                     failureRedirect: '/login' }));
		
		app.get('/user/getWatchList',auth.requiresLogin,userController.getWatchList);
		app.get('/user/addWatchList',auth.requiresLogin,userController.addWatchList);
		
	//paypal-router
		app.get('/paypalCreate',paypalController.paypalCreate);
		app.get('/paypalExecute',paypalController.paypalExecute);
		
		
	//index-router
		app.get('/',indexController.index);
		app.get('/contact',indexController.contact);
		
	
};