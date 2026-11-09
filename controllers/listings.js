const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});
const { categories, categoryNames } = require("../utils/categories.js");


const escapeRegex = (text) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports.index = async (req, res) => {
    const searchQuery = typeof req.query.search === "string"? req.query.search.trim(): "";
    const selectedCategory = typeof req.query.category === "string"? req.query.category: "";
    let filter = {};  //Create an empty MongoDB filter object
    if (selectedCategory) {  //Apply category filter if selected
        if (!categoryNames.includes(selectedCategory)) {
            return res.status(400).send("Invalid category");
        }
        filter.category = selectedCategory;
    }
    // 5. Apply keyword search if entered
    if (searchQuery) {
        const safeQuery = escapeRegex(searchQuery);
        filter.$or = [
            { title: { $regex: safeQuery, $options: "i" } },
            { description: { $regex: safeQuery, $options: "i" } },
            { location: { $regex: safeQuery, $options: "i" } },
            { country: { $regex: safeQuery, $options: "i" } }
        ];
    }
    // Retrieve matching listings and render
    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", {
        allListings,
        categories,
        selectedCategory,
        searchQuery
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs", { categories });
};

module.exports.showListing = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate: {
            path: "author", //populate the author field in the review model, so that we can access the author details in the show.ejs file
        },
    }).populate("owner"); //populate the owner field in the listing model, so that we can access the owner details in the show.ejs file
    if(!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");  //goes to index.ejs 
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async(req, res,next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    let url = req.file.path;
    let filename = req.file.filename; 

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; //set the owner field to the current user's ID
    newListing.image = { url, filename }; //set the image field to the uploaded file's details
    
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "Successfully created a new listing");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");  //goes to index.ejs 
    }
    res.render("listings/edit.ejs", { listing, categories});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id); // Find the existing listing

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    // Extract editable fields, excluding owner and geometry
    const { owner, geometry, ...updatedFields } = req.body.listing;

    // Check if location or country has changed
    const locationChanged =
        listing.location !== updatedFields.location ||
        listing.country !== updatedFields.country;

    // Get new coordinates only if location has changed
    let newGeometry;

    if (locationChanged) {
        let response = await geocodingClient.forwardGeocode({
            query: `${updatedFields.location}, ${updatedFields.country}`,
            limit: 1
        }).send();

        // Check if Mapbox found the location
        if (!response.body.features.length) {
            req.flash("error", "Could not find the updated location!");
            return res.redirect(`/listings/${id}/edit`);
        }
        newGeometry = response.body.features[0].geometry;
    }

    // Update listing details
    listing.set(updatedFields);

    if (newGeometry) {   // Update coordinates if the location changed
        listing.geometry = newGeometry;
    }

    if (req.file) {  // Update image if a new one was uploaded
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = { url, filename };
    }
    // Save updated listing to MongoDB
    await listing.save();

    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async(req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};