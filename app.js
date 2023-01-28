const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

// EJS Mate to allow app to use layouts and partials
const ejsMate = require('ejs-mate');
const {campgroundSchema,reviewSchema} = require('./models/joi models/schemas.js')

// Requiring the campground model
const Campground = require('./models/campground');
const Review = require('./models/review')

const methodOverride = require('method-override');

// Requiring Error Utlilites 
const ExpressError = require('./errorutlis/ExpressError');
const catchAsync   = require('./errorutlis/catchAsync');

const campgroundRoute = require('./routes/campground')


// Mongoose Connection
mongoose.set('strictQuery',true);
mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=>{
    console.log('Mongo Connection Open!');
})
.catch((err)=>{
    console.log('Error in Mongo Connection!');
})

// Setting the view engine to ejs
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

// By default req.body is empty req.body should be parsed
app.use(express.urlencoded({extended:true}));

// Overriding the method for put and delete requests
app.use(methodOverride('_method'));

/* 
App to use ejsMate engine
Creates reusable code that will meet our goal to reduce duplicating code. like using layouts,partials
*/
app.engine('ejs',ejsMate)


/*validating the review  before review is even created using JOI validateReview is a middleware which will be applied to put and post requests
 reviewSchema is in the file schemas.js
 This middleware should be applied to post and put request while creating the review
*/
const validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=> el.message).join(',');
        throw new ExpressError(msg,400);
        }
        else{
            next();
        }
}

// Home Route
app.get('/',(req,res)=>{
   res.render('home.ejs');
})

app.use('/campgrounds',campgroundRoute)


// ---------------------Reviews Routes----------------------

/* ----------------Reviews post route-----------
 The form is on show page of a campground
 Finds the campground with the id(foundCampground), creates a review,
 adds that review to the reviews array of the foundCampground by pushing capground.reviews.push(review)
*/
app.post('/campgrounds/:id/reviews',validateReview,catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))


/* ----------------Delete a review-----------------
 Removing the review in review model and also in campground model (reviews array[])
 Delete a review in campground reviews array by using $pull:{reviews:reviewId} which pulls all the ids which matches to reviewId in reviews array
*/
app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{ $pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))


// Any other route
app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found!!!',404))
})

// Route which is Custom Error Handler
app.use((err,req,res,next)=>{
    const {statusCode=500,message='OH boy there is an error'} = err;
    res.status(statusCode).render('campgrounds/error',{err});
})

// App Listening on the port
app.listen(3000,()=>{
    console.log('Listening on Port 3000');
})

