const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const images = require('../controllers/images')
const catchAsync   = require('../errorutlis/catchAsync');
const {isLoggedIn,isAuthor,validateCampground} = require('../middlewares')
const multer = require('multer');

const {storage,cloudinary} = require('../cloudinary/index');
const Campground = require('../models/campground');
// Store using our cloudinary storage i.e storage
const upload = multer({storage});

router.get('/', catchAsync(campgrounds.index))

router.route('/new')
    .get(isLoggedIn,campgrounds.renderNewForm)
    .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground))
    
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground))


router.route('/:id/edit')
    .get(isLoggedIn, isAuthor,catchAsync(campgrounds.renderEditForm))
    .put(isLoggedIn,isAuthor,validateCampground,catchAsync(campgrounds.updateCampground))

router.route('/:id/images')
    .get(isLoggedIn,images.showCampgroundImages)
    .post(isLoggedIn,isAuthor,upload.array('image'),catchAsync(images.addCampgroundImages))
    .delete(isLoggedIn,isAuthor,catchAsync(images.deleteCampgroundImages))


module.exports = router;