const express = require('express');
const router = express.Router({mergeParams:true});

// Requiring the campground and reviews model
const Campground = require('../models/campground');
const Review = require('../models/review')

const catchAsync   = require('../errorutlis/catchAsync');
const {validateReview, isLoggedIn,isReviewAuthor} =require('../middlewares')



/* ----------------Reviews post route-----------
 The form is on show page of a campground
 Finds the campground with the id(foundCampground), creates a review,
 adds that review to the reviews array of the foundCampground by pushing capground.reviews.push(review)
*/
router.post('/',isLoggedIn,validateReview,catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    review.author = req.user._id;
    await review.save();
    await campground.save();
    req.flash('success','Successfully created a new Review!!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

/* ----------------Delete a review-----------------
 Removing the review in review model and also in campground model (reviews array[])
 Delete a review in campground reviews array by using $pull:{reviews:reviewId} which pulls all the ids which matches to reviewId in reviews array
*/
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{ $pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully Deleted Review!!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;