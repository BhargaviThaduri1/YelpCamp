const User = require('../models/User');


module.exports.renderRegister = (req,res)=>{
    res.render('users/register')
}

module.exports.register = async(req,res,next)=>{
    try{
    const {email , username,password} = req.body;
    const user =  new User({email,username});
    const registeredUser = await User.register(user,password)
    req.login(registeredUser,err=>{
        if(err) next(err);
        else{
            req.flash('success','Welcome to Yelp Camp!!')
            res.redirect('/campgrounds');
        }
    })
    }
    catch(err){
        req.flash('error',err.message);
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req,res)=>{
    res.render('users/login');
}

module.exports.login = (req,res)=>{
    req.flash('success','Welcome Back!!')
    const redirectUrl = req.session.returnTo || 'campgrounds'
    console.log('LoggedIn with User: ',req.user.username)
    console.log("Redirecting to the path/",redirectUrl);
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res)=>{
    req.logout(()=>{
     console.log("Successfully logged you out")
    });
    res.redirect('/campgrounds');
 }