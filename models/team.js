var mongoose = require("mongoose");

// SCHEMA SETUP FOR DANCE TEAM OBJECT
var teamSchema = new mongoose.Schema({
    name:               String,
    fbId:               String,
    profilePic:         String,
    coverPic:           String,
    email:              String,
    fbLink:             String,

    // Biographical information
    bio:                String,
    longDescription:    String,
    shortDescription:   String,
    personalInfo:       String,
    generalInfo:        String,
    awards:             String,
    
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event"
        }
    ]
});

module.exports = mongoose.model("Team", teamSchema);