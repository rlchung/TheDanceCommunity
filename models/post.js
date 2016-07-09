var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
    user:               String,
    text:               String,
    attachedImage:      String
});

module.exports = mongoose.model("Post", postSchema);