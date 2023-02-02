const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
})

// Add on username and password fields to userSchema and makes sure the username are unique
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);