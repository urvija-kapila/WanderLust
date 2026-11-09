//this is a middleware file for all the routes related to listings, it is used to handle all the requests related to listings, and it is used in app.js file as a parent route
const express= require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js"); //middleware to check if the user is logged in, it is used in the routes where the user needs to be logged in to access the route
const listingController = require("../controllers/listings.js"); //importing the listing controller to handle the requests related to listings
const multer = require("multer"); //multer is a middleware for handling multipart/form-data, which is used for uploading files
const { storage } = require("../cloudConfig.js"); //importing the cloudinary storage configuration from cloudConfig.js
const upload = multer({ storage }); //specifying the destination folder for the uploaded files


//these are child routes in the file
router
    .route("/") 
    .get(wrapAsync(listingController.index))   
    .post(isLoggedIn, upload.single("listing[image][url]"), validateListing,  wrapAsync( listingController.createListing)
);

//New route
router.get("/new", isLoggedIn, listingController.renderNewForm); 

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image][url]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)
);

//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports= router;