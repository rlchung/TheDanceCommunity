var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
    user:               String,
    text:               String,
    attachment:         String
});

module.exports = mongoose.model("Post", postSchema);