const mongoose = require('mongoose');
const Review = require('./review')

const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title:String,
    image:String,
    price:Number,
    description:String,
    location:String,
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

