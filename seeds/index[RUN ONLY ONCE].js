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
        const price = Math.floor(Math.random()*50)+10;
        const camp= new Campground({
            author:'63dbcd5a378fad7cb49a89a8',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${randomElement(descriptors)} ${randomElement(places)}`,
            images:[
                {
                    url: 'https://res.cloudinary.com/dbmrc41ir/image/upload/v1676017776/YelpCamp/ruflysy5w7cqb1t58w18.avif',
                    filename: 'YelpCamp/ruflysy5w7cqb1t58w18',
                  },
                  {
                    url: 'https://res.cloudinary.com/dbmrc41ir/image/upload/v1676017777/YelpCamp/g45wcpcm6fqxjlrt3kqd.avif',
                    filename: 'YelpCamp/g45wcpcm6fqxjlrt3kqd',
                  },
                  {
                    url: 'https://res.cloudinary.com/dbmrc41ir/image/upload/v1676017778/YelpCamp/fx0mgcdpjrf5ckvbltg0.avif',
                    filename: 'YelpCamp/fx0mgcdpjrf5ckvbltg0',
                  }
            ],
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore et sapiente non nam? Quibusdam dolor aspernatur tempora asperiores eum magni eos quos, odio fugiat tenetur officiis cumque deserunt! Unde, placeat.',
            price:price
        })
        await camp.save();
    }
}
seedDB();