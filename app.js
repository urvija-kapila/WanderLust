if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require ("express");
const app = express();
const mongoose = require("mongoose");
const path= require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl= process.env.ATLASDB_URL;

// id parameter in "/listings/:id/reviews" stays in app.js file, its not able to reach the review.js file 
main().then(() => {
    console.log("MongoDB connected");
}).catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error", (err)=>{
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //1 week in milliseconds
        maxAge: 7 * 24 * 60 * 60 * 1000, //1 week in milliseconds
        httpOnly: true,
    }
};


app.use(session(sessionOptions));
app.use(flash());    //flash should always come before routes

app.use(passport.initialize()); // for authentication, to initialize passport
app.use(passport.session()); // to keep track of the user session, so that user does not have to login again and again
passport.use(new localStrategy(User.authenticate())); //to use the local strategy for authentication, User.authenticate() is a method provided by passport-local-mongoose to authenticate the user

passport.serializeUser(User.serializeUser()); //to serialize the user, so that user info can be stored in the session
passport.deserializeUser(User.deserializeUser()); //to deserialize the user, so that it can be retrieved from the session

app.use((req,res,next) => { //midleware for flash messages, so that it can be used in all routes
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; //to make the current user available in all routes, so that it can be used in the navbar to show login/logout/signup links
    next();
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listingRouter );   //parent route
app.use("/listings/:id/reviews", reviewRouter);  //parent route
app.use("/", userRouter );

app.all("/*splat", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err,req,res,next) =>{
    let {statusCode=500, message="Something went wrong!"}= err;
    res.status(statusCode).render("error.ejs",{message});
    //res.status(statusCode).send(message);
});


app.listen(8080, () => {
    console.log("Server is running on port 8080");
});