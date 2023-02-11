const ExpressError = require('./errorutlis/ExpressError');
const {campgroundSchema,reviewSchema} = require('./models/joi models/schemas.js')
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be logged in first!')
        return res.redirect('/login');
    }
    next();

}

/*Validating the campground before campground is even created using JOI validateCampground is a middleware which will be applied to put and post requests
 campgroundSchema is in the file schemas.js
*/
module.exports.validateCampground =(req,res,next)=>{ 
    const {error} = campgroundSchema.validate(req.body);
    if(error){
    const msg = error.details.map(el=> el.message).join(',');
    throw new ExpressError(msg,400);
    }
    else{
        next();
    }
}

module.exports.isAuthor = async (req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id) ){
        console.log('User:',req.user.username,'Dont have the permission on',req.method,'method for a campground')
        req.flash('error','You dont have the permission to edit/delete campground.')
        return res.redirect(`/campgrounds/${campground._id}`)
    }
    next();
}

/*
validating the review  before review is even created using JOI validateReview is a middleware which will be applied to put and post requests
 reviewSchema is in the file schemas.js
 This middleware should be applied to post and put request while creating the review
*/
module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=> el.message).join(',');
        throw new ExpressError(msg,400);
        }
        else{
            next();
        }
}

module.exports.isReviewAuthor = async (req,res,next)=>{
    const {id,reviewId} = req.params;
    const campground = await Campground.findById(id);
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id) ){
        console.log('User:',req.user.username,'Dont have the permission on ',req.method,'method for a review')
        req.flash('error','You dont have the permission to edit/delete review.')
        return res.redirect(`/campgrounds/${campground._id}`)
    }
    next();
}