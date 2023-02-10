const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
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
    .get(async(req,res)=>{
        const {id} = req.params;
        const campground = await Campground.findById(id);
        res.render('images/show',{campground});   
    })
    .post(upload.array('image'),catchAsync(async(req,res)=>{
        const {id} = req.params;
        const campground = await Campground.findById(id);
        const imgs = req.files.map(f=>({url:f.path,filename:f.filename}));
        campground.images.push(...imgs);
        await campground.save();
        req.flash('success','Successfully Uploaded the Image(s)');
        res.redirect(`/campgrounds/${campground._id}`);
    }))
    .delete(catchAsync(async(req,res)=>{
        const {id} = req.params;
        const campground = await Campground.findById(id);
        // We have access to images which checked via req.body
        console.log(req.body);
        if(req.body.deleteImages){
            // Deleting Images in Cloudinary
            for(let filename of req.body.deleteImages){
               await cloudinary.uploader.destroy(filename);
            }
            // Deleting Images in Mongo
            await campground.updateOne({$pull:{images:{filename:{$in: req.body.deleteImages}}}});
            req.flash('success','Successfully deleted Image(s)')
            res.redirect(`/campgrounds/${campground._id}`);
        }
        
    }))


module.exports = router;