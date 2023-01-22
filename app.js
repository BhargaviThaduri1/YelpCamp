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


/*alidating the campground before campground is even created using JOI validateCampground is a middleware which will be applied to put and post requests
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

/*alidating the review  before review is even created using JOI validateReview is a middleware which will be applied to put and post requests
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


// Route which displays all the campgrounds
app.get('/campgrounds', catchAsync(async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}))


// Route to create a new Campground
app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new');
})

/* Route for the post request in creating the campground and then redirecting to show page 
/campgrounds/:id--> show the details of campground
*/
app.post('/campgrounds/new',validateCampground,catchAsync(async (req,res,next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
    
    // Validating the req.body using JOI before even creating the campground
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
    
}))


// Route which displays the details of a campground
// And also display the reviews for each campground by populating the reviews
app.get('/campgrounds/:id', catchAsync(async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show',{campground});
}))


// Route which renders the form to edit a campground
app.get('/campgrounds/:id/edit', catchAsync(async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit',{campground});
}))


// Route which actually update a campground
app.put('/campgrounds/:id/edit', validateCampground,catchAsync(async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))


// Route which deletes a campground and then redirecting to campgrounds
app.delete('/campgrounds/:id', catchAsync(async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds');
}))




// ---------------------Reviews Routes----------------------

// ----------------Reviews post route-----------
app.post('/campgrounds/:id/reviews',validateReview,catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))


// ----------------Delete a review-----------------
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

