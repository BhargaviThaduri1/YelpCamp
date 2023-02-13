const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();
const Users = require('../controllers/users')

router.route('/register')
    .get(Users.renderRegister)
    .post(Users.register)

router.route('/login')
    .get(Users.renderLogin)
    .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login',successFlash:true,    keepSessionInfo: true,
    }),Users.login)


router.get('/logout',Users.logout)

module.exports = router;