var mongoose = require("mongoose");

// SCHEMA SETUP FOR DANCE TEAM OBJECT
var teamSchema = new mongoose.Schema({
    name:               String,
    fbId:               String,
    profilePic:         String,
    email:              String,
    fbLink:             String,
    location:           String,

    // Biographical information
    bio:                String,
    longDescription:    String,
    shortDescription:   String,
    personalInfo:       String,
    generalInfo:        String,
    awards:             String,
    // events is an array that contains the "fbId" of events
    events:             [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "Event"
        }
    ]
});

teamSchema.static('findByFbId', function (fbId, callback) {
  return this.find({ fbId: fbId }, callback);
});

module.exports = mongoose.model("Team", teamSchema);