const express = require('express');
const router = express.Router({mergeParams:true});

const Reviews = require('../controllers/reviews')
const catchAsync   = require('../errorutlis/catchAsync');
const {validateReview, isLoggedIn,isReviewAuthor} =require('../middlewares')



/* ----------------Reviews post route-----------
 The form is on show page of a campground
 Finds the campground with the id(foundCampground), creates a review,
 adds that review to the reviews array of the foundCampground by pushing capground.reviews.push(review)
*/
router.post('/',isLoggedIn,validateReview,catchAsync(Reviews.createReview))

/* ----------------Delete a review-----------------
 Removing the review in review model and also in campground model (reviews array[])
 Delete a review in campground reviews array by using $pull:{reviews:reviewId} which pulls all the ids which matches to reviewId in reviews array
*/
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(Reviews.deleteReview))

module.exports = router;