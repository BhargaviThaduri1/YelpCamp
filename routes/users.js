const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();
const Users = require('../controllers/users')


router.get('/register',Users.renderRegister)

router.post('/register',Users.register)

router.get('/login',Users.renderLogin)

router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login',successFlash:true,    keepSessionInfo: true,
}),Users.login)

router.get('/logout',Users.logout)

module.exports = router;