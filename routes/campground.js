const express = require('express');
const router = express.Router();

// Requiring the campground model
const Campground = require('../models/campground');


// Requiring Error Utlilites 
const catchAsync   = require('../errorutlis/catchAsync');

const {isLoggedIn,isAuthor,validateCampground} = require('../middlewares')


// Route which displays all the campgrounds
router.get('/', catchAsync(async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}))


// Route to create a new Campground
router.get('/new',isLoggedIn,(req,res)=>{
    res.render('campgrounds/new');
})

/* Route for the post request in creating the campground and then redirecting to show page 
/campgrounds/:id--> show the details of campground
validating the review  before review is even created using validateCampground Middleware which uses JOI
*/
router.post('/new',isLoggedIn,validateCampground,catchAsync(async (req,res,next)=>{
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    console.log(campground);
    await campground.save();
    req.flash('success','Successfully made a new campground!!')
    res.redirect(`/campgrounds/${campground._id}`);
    
}))

/*
 Route which displays the details of a campground
 And also display the reviews for each campground by populating the reviews
 And also display the author for each campground by populating the author field
*/
 router.get('/:id', catchAsync(async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id)
    .populate({path: 'reviews',populate:{path:'author'}})
    .populate('author');
    if(!campground){
        req.flash('error','Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}))


// Route which renders the form to edit a campground
router.get('/:id/edit',isLoggedIn, isAuthor,catchAsync(async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}))


// Route which actually update a campground
router.put('/:id/edit',isLoggedIn,isAuthor,validateCampground,catchAsync(async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    req.flash('success','Successfully updated campground!!')
    res.redirect(`/campgrounds/${campground._id}`);
}))


/* Route which deletes a campground and then redirecting to campgrounds
   And also deletes all the reviews which are associated to that campground by using
   campgroundSchema.post('findoneAndDelete',(data)) post middleware in campground model
 */
router.delete('/:id',isLoggedIn,isAuthor, catchAsync(async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted campground!!')
    res.redirect('/campgrounds');
}))

module.exports = router;