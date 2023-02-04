module.exports.isLoggedIn = (req,res,next)=>{
    console.log('Req.user',req.user)
    if(!req.isAuthenticated()){
        req.flash('error','You must be logged in!')
        return res.redirect('/login');
    }
    next();

}