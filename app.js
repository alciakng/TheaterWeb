
/**
 * Module dependencies.
 */
global.controllers = function(name) {
    return require(__dirname + '/controllers/' + name);
}
global.config = function(name) {
    return require(__dirname + '/config/' + name);
}

var express = require('express')
  , http = require('http')
  , path = require('path')
  , swig = require('swig');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



config('router.js')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
