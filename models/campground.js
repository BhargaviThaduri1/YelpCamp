const mongoose = require('mongoose');
const { campgroundSchema } = require('./joi models/schemas');
const Review = require('./review')

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url:String,
    filename:String
})


// WHENEVER WE CALL THUMBNAIL ON CAMPGROUND.IMAGES.THUMBNAIL THEN VIRTUAL AUTOMATICALLY ADDS W_400 WHICH IS THE WIDTH/HEIGHT OF THE IMAGE
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_300,h_300');
})

// DEFINING CAMPGROUND SCHEMA OPTIONS
const options = {
    // WHEN CONVERTED TO JSON, ADD VIRTUAL PROPERTIES TO THE RESULT
    toJSON: { virtuals: true }
};

const CampgroundSchema = new Schema({
    title:String,
    images:[ImageSchema],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    price:Number,   
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
},options);

CampgroundSchema.virtual('properties.popUpText').get(function () {
    return `<div class='card popup'><div class='card-header'><a href='/campgrounds/${this._id}' title='View Campground'><h5>${this.title}</h5></a></div><div class='card-body'><p class='card-text text-muted'>${this.location}</p></div></div>`;
});

// Deleting all the reviews which are associated with a campground when deleted
CampgroundSchema.post('findOneAndDelete',async function(campground){
    if(campground.reviews){
        await Review.deleteMany({_id:{$in:campground.reviews}})
    }
})

const Campground = mongoose.model('Campground',CampgroundSchema);

module.exports = Campground;

