const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

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

app.use(methodOverride('_method'));

// Home Route
app.get('/',(req,res)=>{
   res.render('home.ejs');
})


// Route which displays all the campgrounds
app.get('/campgrounds', async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
})


// Route to create a new Campground
app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new');
})

/* Route for the post request in creating the campground and then redirecting to show page 
/campgrounds/:id--> show the details of campground
*/
app.post('/campgrounds/new',async (req,res)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})


// Route which displays the details of a campground
app.get('/campgrounds/:id', async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show',{campground});
})


// Route which renders the form to edit a campground
app.get('/campgrounds/:id/edit', async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit',{campground});
})


// Route which actually update a campground
app.put('/campgrounds/:id/edit', async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
})


// Route which deletes a campground and then redirecting to campgrounds
app.delete('/campgrounds/:id', async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds');
})


// App Listening on the port
app.listen(3000,()=>{
    console.log('Listening on Port 3000');
})