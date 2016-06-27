var mongoose = require("mongoose");

// SCHEMA SETUP FOR EVENT OBJECT
var eventSchema = new mongoose.Schema({
    name:               String,
    id:                 String,
    image:              String,
    cover_photo:        String,
    host_name:          String,
    hostId:             String,
    // general event information
    description:        String,
    place:              String,
    start_time:         String,
    end_time:           String,
    //To categorize which section to display it in (Audition, Workshop, General)
    category:           String,
    // Attendance information
    attending_count:    Number,
    declined_count:     Number,
    interested_count:   Number,
    maybe_count:        Number,
    // Posted Media
    photos:             [String],
    // Updating purposes
    updated_time:       Date,
});

module.exports = mongoose.model("Event", eventSchema);