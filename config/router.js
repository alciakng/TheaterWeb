

var superController = controllers('superController.js');
var movieController = controllers('movieController.js');
var userController = controllers('userController.js');
var paypalController = controllers('paypalController.js');

//auth-middleware
var auth = require('./middlewares/auth.js');

module.exports = function(app,passport){
	
	app.get('/show',superController.selectValue);
	
	//movie-router
		app.get('/movie/add', superController.showPage);
		app.post('/movie/add',superController.addMovie);
		app.get('/movie/list',movieController.showListOfMovie);
		app.get('/movie/search',movieController.searchMovie);
		app.get('/movie/time',movieController.getTimeOfMovie);
	
	//booking-router
		app.get('/book/init',movieController.book1_init)
		app.get('/book/seat',movieController.book2_seat);
		app.get('/book/buy',movieController.book3_buy);
		app.get('/book/final',movieController.book4_final);
	
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
		app.get('/auth/facebook', passport.authenticate('facebook',{ scope: [ 'email' ] }));
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
		
	//paypal-router
		app.get('/paypalCreate',paypalController.paypalCreate);
		app.get('/paypalExecute',paypalController.paypalExecute);
		
		
	//index-router
		app.get('/',movieController.index);
		app.get('/test',movieController.test);
	
};