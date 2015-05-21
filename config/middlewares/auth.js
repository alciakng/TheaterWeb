/**
 * New node file
 */


exports.requiresLogin = function (req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}


exports.bookingRequiresLogin = function(req,res,next){
	if (req.isAuthenticated()) return next();
	res.redirect('/book/question');
}






/*
exports.isLogin = function(req,res,next){
	if(req.isAuthenticated()) return next()
	res.redirect('index/index');
}
*/