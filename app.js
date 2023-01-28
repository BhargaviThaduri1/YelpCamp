const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

// EJS Mate to allow app to use layouts and partials
const ejsMate = require('ejs-mate');

// Overrides post as put or delete requests
const methodOverride = require('method-override');

// Requiring the campground and reviews routes
const campgroundRoute = require('./routes/campground')
const reviewRoute = require('./routes/reviews')

const ExpressError = require('./errorutlis/ExpressError');

// Requiring the session
const session = require('express-session')

// Requring a flash
const flash = require('connect-flash')

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

// To use static files like js and css
app.use(express.static(path.join(__dirname,'public')))

//App to use ejsMate engine Creates reusable code that will meet our goal to reduce duplicating code. like using layouts,partials
app.engine('ejs',ejsMate)

const sessionOptions = {
    secret:'thisshouldbebettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

// App to use session with the sessionOptions and session exprires within 1 week 1000* 60*60*24*7
app.use(session(sessionOptions));

// App to use for every single request
app.use(flash());

// Add a variable success which can be used by any template which is going to render i.e in index.ejs,edit.ejs
app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    next();
})

// Home Route
app.get('/',(req,res)=>{
   res.render('home.ejs');
})

// campground routes
app.use('/campgrounds',campgroundRoute)

// Review routes.If we want to access :id params in the reviews route file then set mergeParams:true in reviews.js file
app.use('/campgrounds/:id/reviews',reviewRoute)


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

