const User = require('../models/user')

// WHICH RENDERS A FORM
module.exports.renderRegister = (req,res)=>{
    res.render('users/register')
}

// FOR REGISTERING A USER
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

// FOR RENDERING LOGIN PAGE
module.exports.renderLogin = (req,res)=>{
    res.render('users/login');
}

// FOR AUTHENTICATING A USER 
module.exports.login = (req,res)=>{
    req.flash('success','Welcome Back!!')
    const redirectUrl = req.session.returnTo || 'campgrounds'
    console.log('LoggedIn with User: ',req.user.username)
    console.log("Redirecting to the path: /",redirectUrl);
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

// MAKE USER TO LOGOUT
module.exports.logout = (req,res)=>{
    req.logout(()=>{
     console.log("Successfully logged you out")
    });
    res.redirect('/campgrounds');
 }