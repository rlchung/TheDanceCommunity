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

postSchema.static('findByFbId', function (fbId, callback) {
  return this.find({ fbId: fbId }, callback);
});

module.exports = mongoose.model("Post", postSchema);