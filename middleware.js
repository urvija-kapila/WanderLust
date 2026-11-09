const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema, reviewSchema } = require("./schema.js"); // for server side validation of listing
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){  //passport method to  check if the user is authenticated
        //saving redirect url in session, so that after login user can be redirected to the page he wanted to access before login
        req.session.redirectUrl = req.originalUrl;  //making a variable to store the current url to redirect to later after logging in
        req.flash("error", "You must be signed in for that action!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl; //saving the redirect url in locals of passport package becaus w/o it if there was any info stored it wont be saved in sessiom. alone hence this
    }
    next();
};

module.exports.isOwner = async(req,res,next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of that listing!");
        return res.redirect(`/listings/${id}`);  //goes to index.ejs 
    }
    next();
};


module.exports.validateListing= (req,res,next) => {
    let {error}= listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview= (req,res,next) => {
    let {error}= reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async(req,res,next) => {
    let { id,reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of that review!");
        return res.redirect(`/listings/${id}`);  //goes to index.ejs 
    }
    next();
};