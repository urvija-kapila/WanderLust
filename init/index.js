const mongoose = require("mongoose");
const initData= require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("MongoDB connected");
    }).catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "6aeccadc8a808c8ed397a386"})); //adding owner field to each listing object, so that it can be used to populate the owner field in the listing model
    await Listing.insertMany(initData.data);
    console.log("Database initialized ");
};

initDB();
