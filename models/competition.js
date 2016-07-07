var mongoose    = require("mongoose");

var competitionSchema = new mongoose.Schema({
    name:               String,
    fb_id:                 String,
    profile_pic:        String,
    cover_pic:          String,
    email:              String,
    fb_link:            String,
    
    bio:                String,
    short_description:  String,
    long_description:   String,
    personal_info:      String,
    awards:             String,
    website:            String
});

module.exports = mongoose.model("Competition",competitionSchema);