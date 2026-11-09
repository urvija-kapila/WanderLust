const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

userSchema.plugin(passportLocalMongoose);  //adds username,hashing,salting and hashed pwd automatically to the schema, so we dont have to do it manually 

module.exports = mongoose.model("User", userSchema);