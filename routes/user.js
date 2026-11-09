//this is a middleware file for checking if the user is logged in or not, 
const express= require("express");
const router = express.Router({mergeParams: true}); //mergeParams: true is used to merge the params from the parent route, so that we can access the id parameter in the child route
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js"); //importing the user controller to handle the requests related to users

router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup)
);

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), userController.login
);

router.get("/logout", userController.logout);

module.exports= router;