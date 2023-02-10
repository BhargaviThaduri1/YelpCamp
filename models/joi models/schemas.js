const Joi = require('joi');

module.exports.campgroundSchema =  Joi.object({
    campground:Joi.object({
        title:Joi.string().required(),
        price:Joi.number().required().min(0),
        // images:Joi.string().required(),
        location:Joi.string(),
        description:Joi.string()
    }).required()
})


module.exports.reviewSchema = Joi.object({
    review:Joi.object({
        rating:Joi.number().required().max(5).min(1),
        body:Joi.string().required()
    }).required()
})