var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
    user:               String,
    fbId:               String,
    message:            String,
    link:               String,
    attachments:        [String],
    created_time:       Date,
    updated_time:       Date
});

module.exports = mongoose.model("Post", postSchema);