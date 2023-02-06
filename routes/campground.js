const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const Campground = require('../models/campground');
const catchAsync   = require('../errorutlis/catchAsync');

const {isLoggedIn,isAuthor,validateCampground} = require('../middlewares')


router.get('/', catchAsync(campgrounds.index))

router.route('/new')
    .get(isLoggedIn,campgrounds.renderNewForm)
    .post(isLoggedIn,validateCampground,catchAsync(campgrounds.createCampground))


router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground))


router.route('/:id/edit')
    .get(isLoggedIn, isAuthor,catchAsync(campgrounds.renderEditForm))
    .put(isLoggedIn,isAuthor,validateCampground,catchAsync(campgrounds.updateCampground))


module.exports = router;