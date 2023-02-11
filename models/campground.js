const mongoose = require('mongoose');
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
const CampgroundSchema = new Schema({
    title:String,
    images:[ImageSchema],
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
});


// Deleting all the reviews which are associated with a campground when deleted
CampgroundSchema.post('findOneAndDelete',async function(campground){
    if(campground.reviews){
        await Review.deleteMany({_id:{$in:campground.reviews}})
    }
})

const Campground = mongoose.model('Campground',CampgroundSchema);

module.exports = Campground;

