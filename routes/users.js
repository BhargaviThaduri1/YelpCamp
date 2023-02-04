const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

router.get('/register',(req,res)=>{
    res.render('users/register')
})

router.post('/register',async(req,res)=>{
    try{
    const {email , username,password} = req.body;
    const user =  new User({email,username});
    const registeredUser = await User.register(user,password)
    req.flash('success','Welcome to Yelp Camp!!')
   res.redirect('/campgrounds');
    }
    catch(err){
        req.flash('error',err.message);
        res.redirect('/register')
    }
})

router.get('/login',(req,res)=>{
    res.render('users/login');
})

router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login',successFlash:true}),(req,res)=>{
    console.log("Successfully loggedIn")
    console.log("Here is the user",req.user.username)
    req.flash('success','Welcome Back!!')
    res.redirect('/campgrounds');
})

router.get('/logout',(req,res)=>{
   console.log("User with name",req.user.username)
   req.logout(()=>{
    console.log("Successfully logged you out")
   });
   res.redirect('/campgrounds');
})

module.exports = router;