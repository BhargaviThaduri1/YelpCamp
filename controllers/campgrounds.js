const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken:process.env.MAPBOX_TOKEN});

module.exports.index = async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}
module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new');
}
module.exports.createCampground = async (req,res,next)=>{
    // GEOCODING THE LOCATIONS IT GIVES 1 RESULT AND THE LATTITUE AND LONGITUDE WILL BE IN GEOMETRY OBJECT.HENCE SELECTING FEATURES[0].GEOMETRY
    // AFTER GETTING LONGITUDE AND LONGITUDE STORE THEM IN MONGO i.e STORE GEOMETRY(GEOJSON FORMAT)
    const geoData = await geoCoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()

    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;

    // We have access to req.files=> which gives all the files which uploaded
    campground.images = req.files.map(f=>({url:f.path,filename:f.filename}))

    // Inserting geometry
    campground.geometry = geoData.body.features[0].geometry;
    console.log(campground.geometry);

    await campground.save();

    req.flash('success','Successfully made a new campground!!')
    res.redirect(`/campgrounds/${campground._id}`);
    
}
module.exports.showCampground = async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id)
    .populate({path: 'reviews',populate:{path:'author'}})
    .populate('author');
    if(!campground){
        req.flash('error','Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}
module.exports.renderEditForm = async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}
module.exports.updateCampground = async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    req.flash('success','Successfully updated campground!!')
    res.redirect(`/campgrounds/${campground._id}`);
}
module.exports.deleteCampground = async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted campground!!')
    res.redirect('/campgrounds');
}