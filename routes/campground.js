const express = require('express');
const router = express.Router();

// Requiring the campground model
const Campground = require('../models/campground');

// Requiring the campgroundSchema which is a Joi Model
const {campgroundSchema} = require('../models/joi models/schemas.js')


// Requiring Error Utlilites 
const ExpressError = require('../errorutlis/ExpressError');
const catchAsync   = require('../errorutlis/catchAsync');

const {isLoggedIn} = require('../middlewares')

/*Validating the campground before campground is even created using JOI validateCampground is a middleware which will be applied to put and post requests
 campgroundSchema is in the file schemas.js
*/
const validateCampground =(req,res,next)=>{ 
    const {error} = campgroundSchema.validate(req.body);
    if(error){
    const msg = error.details.map(el=> el.message).join(',');
    throw new ExpressError(msg,400);
    }
    else{
        next();
    }
}

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
router.post('/new',validateCampground,catchAsync(async (req,res,next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
    
    // Validating the req.body using JOI before even creating the campground
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success','Successfully made a new campground!!')
    res.redirect(`/campgrounds/${campground._id}`);
    
}))

/*
 Route which displays the details of a campground
 And also display the reviews for each campground by populating the reviews
*/
 router.get('/:id', catchAsync(async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if(!campground){
        req.flash('error','Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}))


// Route which renders the form to edit a campground
router.get('/:id/edit', catchAsync(async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}))


// Route which actually update a campground
router.put('/:id/edit', validateCampground,catchAsync(async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    req.flash('success','Successfully updated campground!!')
    res.redirect(`/campgrounds/${campground._id}`);
}))


/* Route which deletes a campground and then redirecting to campgrounds
   And also deletes all the reviews which are associated to that campground by using
   campgroundSchema.post('findoneAndDelete',(data)) post middleware in campground model
 */
router.delete('/:id', catchAsync(async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted campground!!')
    res.redirect('/campgrounds');
}))

module.exports = router;