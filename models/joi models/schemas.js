const BaseJoi = require('joi');
// MAKING JOI TO USE THE EXTENSION WHICH PREVENTS THE STRING SHOULD NOT CONTAIN ANY HTML ELEMENTS LIKE SCRIPTS
const sanitizeHtml = require('sanitize-html');

const extension = (joi) =>({
    type:'string',
    base:joi.string(),
    messages:{
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules:{
        escapeHTML:{
            validate(value,helpers){
                const clean = sanitizeHtml(value,{
                    allowedTags:[],
                    allowedAttributes:{},
                });
                if(clean!==value) return helpers.error('string.escapeHTML',{value})
                return clean;
            }
        }
    }
})

// MAKING JOI TO EXTEND THAT EXTENSION
const Joi = BaseJoi.extend(extension);

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