var mongoose = require("mongoose");

// SCHEMA SETUP FOR EVENT OBJECT
var eventSchema = new mongoose.Schema({
    name:               String,
    fbId:               String,
    cover:              String,
    coverFallback:      String,
    hostName:           String,
    hostId:             String,
    // general event information
    description:        String,
    place:              String,
    startTime:          Date,
    endTime:            Date,
    //To categorize which section to display it in (Audition, Workshop, General)
    category:           String,
    // Attendance information
    attendingCount:     Number,
    declinedCount:      Number,
    interestedCount:    Number,
    maybeCount:         Number,
    // Posted Media
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    
    photos:             [String],
    // Updating purposes
    updatedTime:        Date,
});

eventSchema.static('findByFbId', function (fbId, callback) {
  return this.find({ fbId: fbId }, callback);
});

module.exports = mongoose.model("Event", eventSchema);