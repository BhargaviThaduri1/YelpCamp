const Campground = require('../models/campground')
module.exports.showCampgroundImages = async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/images/manage',{campground});   
}
module.exports.addCampgroundImages = async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const imgs = req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    req.flash('success','Successfully Uploaded the Image(s)');
    res.redirect(`/campgrounds/${campground._id}`);
}
module.exports.deleteCampgroundImages = async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    // We have access to images which checked via req.body
    console.log(req.body);
    if(req.body.deleteImages){
        // Deleting Images in Cloudinary
        for(let filename of req.body.deleteImages){
           await cloudinary.uploader.destroy(filename);
        }
        // Deleting Images in Mongo
        await campground.updateOne({$pull:{images:{filename:{$in: req.body.deleteImages}}}});
        req.flash('success','Successfully deleted Image(s)')
        res.redirect(`/campgrounds/${campground._id}`);
    }
    
}