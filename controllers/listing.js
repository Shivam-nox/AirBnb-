const Listing = require("../models/listing");
const cloudinary = require('cloudinary');
const User=require("../models/user");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings })
};

module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id).populate("reviews").populate({ path: "reviews", populate: { path: "author", } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing does not exist");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
     let url=req.file.path;
     let filename=req.file.filename;
   
    //    let {title,description,image,price,country,location}=req.body;
    const newListing = new Listing(req.body.listing);
   newListing.image={url,filename};
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing created");
    res.redirect("./listings");
};

module.exports.renderEdit = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist");
        res.redirect("/listings");
    }
    let orignalImgUrl=listing.image.url;
   orignalImgUrl= orignalImgUrl.replace("/upload","/upload/h_300,w_250")
    res.render("./listings/edit.ejs", { listing,orignalImgUrl });
};

module.exports.renderUpdate = async (req, res) => {
   
    let { id } = req.params;
   let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });
   if(typeof req.file !=undefined)
    {
   let url=req.file.path;
   let filename=req.file.filename;
   listing.image={url,filename};
   await listing.save();
   }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
     let deletedListing = await Listing.findByIdAndDelete(id);
    
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};