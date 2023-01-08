const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

const Campground = require('./models/campground');

mongoose.set('strictQuery',true);
mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=>{
    console.log('Mongo Connection Open!');
})
.catch((err)=>{
    console.log('Error in Mongo Connection!');
})



app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));


app.get('/',(req,res)=>{
   res.render('home.ejs');
})

app.get('/makecampground',async (req,res)=>{
    const camp = new Campground({title:'My Backyard',description:'cheap campging'})
    await camp.save();
    res.send(camp);
})

app.listen(3000,()=>{
    console.log('Listening on Port 3000');
})