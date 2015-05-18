
/**
 * Module dependencies.
 */
global.controllers = function(name) {
    return require(__dirname + '/controllers/' + name);
}
global.config = function(name) {
    return require(__dirname + '/config/' + name);
}
//project 전체 configuration 변수들을 모아 놓은 envConfig를 global variable로 선언한다.
global.envConfig = config('envConfig.json');

var express = require('express')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , flash = require('connect-flash')
  , swig = require('swig')
  , paypal = require('paypal-rest-sdk')
  , viewHelper = require('view-helpers')

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.configure(function() {
	app.use(express.cookieParser('keyboard cat'));
	app.use(express.session({ cookie: { maxAge: 36000000}}));
	app.use(flash());
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(viewHelper());
});

//passport set
config('passport.js')(passport);
//paypal set
config('paypal.js')(paypal);
//router set
config('router.js')(app,passport);
//db set
config('dbconfig');



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
