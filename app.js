// .ENV FILE HELPS TO KEEP SENSITIVE INFORMATION IF THE APP IS NOT YEL LIVE.WHEN WE ARE IN "PRODUCTION MODE"
// CAN ACCESS THOSE INFORMATION BY USING PROCESS.ENV.CLODINARY_CLOUD_NAME
if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

// EJS MATE TO ALLOW APP TO USE PARTIALS AND LAYOUTS
const ejsMate = require('ejs-mate');

// OVERRIDES POST AS PUT/DELETE REQUEST
const methodOverride = require('method-override');

// REQURING THE CAMPGROUND,REVIEWS AND USERS ROUTES
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users');


// REQURING USER MODEL FOR PASSPORT
const User = require('./models/User')

// REQUIRING EXPRESS ERROR
const ExpressError = require('./errorutlis/ExpressError');

// REQURING SESSION AND FLASH
const session = require('express-session');
const flash = require('connect-flash');

// CONFIGURING PASSPORT
const passport = require('passport');
const LocalStrategy = require('passport-local')

// EXPRESS MONGOOSE SANITIZE TO PREVENT MONGODB OPERATOR INJECTION
const mongoSanitize = require('express-mongo-sanitize');

// REQURING HELMET WHICH MAKES OUR APP MUCH SECURE
const helmet = require('./security/Helmet Configuration');
app.use(helmet);


// ESTABLISHING MONGOOSE CONNECTION
mongoose.set('strictQuery',true);
mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=>{
    console.log('Mongo Connection Open!');
})
.catch((err)=>{
    console.log('Error in Mongo Connection!');
})

// SETTING THE VIEW ENGINE TO EJS
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

// PARSING REQUEST.BODY
app.use(express.urlencoded({extended:true}));

// OVERRIDING METHOD FOR PUT AND DELETE REQUESTS
app.use(methodOverride('_method'));

// APP TO USE STATIC FILES LIKE CSS AND JS (VALIDATION FORM)
app.use(express.static(path.join(__dirname,'public')))

// APP TO USE EJS MATE
app.engine('ejs',ejsMate)

// CONFIGURING SESSION OPTIONS
const sessionOptions = {
    // SETTING UP COOKIE NAME
    name:'session',
    // TO SECURE OUR COOKIE
    // secure:true,
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

// APP TO USE FLASH FOR EVERY SINGLE REQUEST
app.use(flash());

// CONFIGURING PASSPORT FOR AUTHENTICATION, TO AUTOMATICALLY REMOVE/ADD A USER TO SESSION USING SERIALIZEUSER/DESERIALIZEUSER
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

//  APP TO USE MONGO SANITIZE WHICH WILL STRIP OUT ANY KEYS  THAT START WITH '$' IN THE INPUT QUERY/PARAMS.
app.use(mongoSanitize());

// CREATING VARIABLES LIKE SUCCESS/ERRORS WHICH CAN BE USED BY ANY TEMPLATE WHICH THE APP RENDERS 
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// CAMPGROUND HOME ROUTE
app.get('/',(req,res)=>{
   res.render('home.ejs');
})

// ALL CAMPGROUND ROUTES.
app.use('/campgrounds',campgroundRoutes)

// ALL REVIEW ROUTES. (IF WE WANT TO ACCESS :ID PARAMS IN THE REVIEWS ROUTE FILE THEN SET MERGEPARAMS:TRUE IN REVIEW.JS ROUTE FILE)
app.use('/campgrounds/:id/reviews',reviewRoutes)

// ALL USERS ROUTES (REGISTER.EJS)
app.use('/',userRoutes);

// ANY OTHER ROUTE
app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found!!!',404))
})

// CUSTOM ERROR HANDLER
app.use((err,req,res,next)=>{
    const {statusCode=500,message='OH boy there is an error'} = err;
    res.status(statusCode).render('campgrounds/error',{err});
})

// APP TO LISTEN ON PORT 3000
app.listen(3000,()=>{
    console.log('Listening on Port 3000');
})

