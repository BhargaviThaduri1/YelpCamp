const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const Campground = require('../models/campground');
const catchAsync   = require('../errorutlis/catchAsync');

const {isLoggedIn,isAuthor,validateCampground} = require('../middlewares')


router.get('/', catchAsync(campgrounds.index))

router.get('/new',isLoggedIn,campgrounds.renderNewForm)

router.post('/new',isLoggedIn,validateCampground,catchAsync(campgrounds.createCampground))

router.get('/:id', catchAsync(campgrounds.showCampground))


router.get('/:id/edit',isLoggedIn, isAuthor,catchAsync(campgrounds.renderEditForm))


router.put('/:id/edit',isLoggedIn,isAuthor,validateCampground,catchAsync(campgrounds.updateCampground))


router.delete('/:id',isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;