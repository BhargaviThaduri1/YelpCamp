const mongoose = require('mongoose');
const Campground = require('../models/campground');

// -------------Requiring the cities file-----
const cities = require('./cities');

// ------------Requiring the descriptors and Places file
const {places,descriptors} = require('./descriptorsAndplaces');

mongoose.set('strictQuery',true);
mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=>{
    console.log('Mongo Connection Open!');
})
.catch((err)=>{
    console.log('Error in Mongo Connection!');
})

// Getting the random element in descriptors and places by passing the array
const randomElement = (array)=> array[Math.floor(Math.random()*array.length)]

const seedDB = async ()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const camp= new Campground({
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${randomElement(descriptors)} ${randomElement(places)}`
        })
        await camp.save();
    }
}
seedDB();