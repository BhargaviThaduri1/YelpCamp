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
module.exports = BaseJoi.extend(extension);
