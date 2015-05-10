/**
 * New node file
 */


exports.requiresLogin = function (req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect('/user')
}
/*
exports.isLogin = function(req,res,next){
	if(req.isAuthenticated()) return next()
	res.redirect('index/index');
}
*/