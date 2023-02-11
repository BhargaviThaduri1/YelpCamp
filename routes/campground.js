const express = require('express');
const router = express.Router();
const catchAsync   = require('../errorutlis/catchAsync');
const {isLoggedIn,isAuthor,validateCampground} = require('../middlewares');

// CAMPGROUND CONTROLLER WHICH HAS COMPLETE CODE IN CREATING A CAMPGROUND..
const campgrounds = require('../controllers/campgrounds')

// REQURING CAMPGROUND MODEL FOR CAMPGROUND IAMGES
const Campground = require('../models/campground');

// REQURING STORAGE AND CLOUDINARY
const {storage,cloudinary} = require('../cloudinary/index');

// REQURING MULTER WHICH PROCESS THE FILES
const multer = require('multer');

// STORE IMAGES USING OUR CLOUDINARY STORAGE
const upload = multer({storage});

// CAMPGROUND INDEX PAGE ALL CAMPGROUNDS
router.get('/', catchAsync(campgrounds.index))

// CAMPGROUND ROUTE TO CREATE A NEW CAMPGROUND
router.route('/new')
    .get(isLoggedIn,campgrounds.renderNewForm)
    .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground))
    
// CAMPGROUND ROUTE TO VIEW/DELETE A CAMPGROUND
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground))

// CAMPGROUND ROUTE TO GET/EDIT A CAMPGROUND
router.route('/:id/edit')
    .get(isLoggedIn, isAuthor,catchAsync(campgrounds.renderEditForm))
    .put(isLoggedIn,isAuthor,validateCampground,catchAsync(campgrounds.updateCampground))

// CAMPGROUND ROUTES WHICH HANDLES VIEWING ALL IAMGES/UPLOADING NEW IMAGES/DELETING IMAGES FROM OR TO CLOUDINARY

router.get('/:id/images/show',isLoggedIn,isAuthor,async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/manageImages',{campground});   
})
router.route('/:id/images')
    .post(isLoggedIn,isAuthor,upload.array('image'),catchAsync(async(req,res)=>{
        const {id} = req.params;
        const campground = await Campground.findById(id);
        const imgs = req.files.map(f=>({url:f.path,filename:f.filename}));
        campground.images.push(...imgs);
        await campground.save();
        req.flash('success','Successfully Uploaded the Image(s)');
        res.redirect(`/campgrounds/${campground._id}`);
    }))
    .delete(isLoggedIn,isAuthor,catchAsync(async(req,res)=>{
        const {id} = req.params;
        const campground = await Campground.findById(id);
        // We have access to images which checked via req.body
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