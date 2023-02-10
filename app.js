// .env file helps to keep sensitve information if the app not yet live i.e currently we are in development mode 
if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

console.log(process.env.CLOUDINARY_CLOUD_NAME)
console.log(process.env.CLOUDINARY_SECRET)
console.log(process.env.CLOUDINARY_KEY)

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

// EJS Mate to allow app to use layouts and partials
const ejsMate = require('ejs-mate');

// Overrides post as put or delete requests
const methodOverride = require('method-override');

// Requiring the campground and reviews,users routes
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users');


// Requring the userModel for passport
const User = require('./models/User')

// Express Error
const ExpressError = require('./errorutlis/ExpressError');

const session = require('express-session');
const flash = require('connect-flash');

// Configuring passport
const passport = require('passport');
const LocalStrategy = require('passport-local')


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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 


// Add a variable success/errors which can be used by any template which is going to render i.e in index.ejs,edit.ejs
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Home Route
app.get('/',(req,res)=>{
   res.render('home.ejs');
})

// campground routes
app.use('/campgrounds',campgroundRoutes)

// Review routes.If we want to access :id params in the reviews route file then set mergeParams:true in reviews.js file
app.use('/campgrounds/:id/reviews',reviewRoutes)

// Users routes like register..
app.use('/',userRoutes);

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

