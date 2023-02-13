const Joi = require('../../security/JOI Configuration')

module.exports.campgroundSchema =  Joi.object({
    campground:Joi.object({
        title:Joi.string().required().escapeHTML(),
        price:Joi.number().required().min(0),
        // images:Joi.string().required(),
        location:Joi.string().escapeHTML(),
        description:Joi.string().escapeHTML()
    }).required()
})


module.exports.reviewSchema = Joi.object({
    review:Joi.object({
        rating:Joi.number().required().max(5).min(1),
        body:Joi.string().required().escapeHTML()
    }).required()
})