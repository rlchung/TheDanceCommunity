var mongoose    = require("mongoose");

var competitionSchema = new mongoose.Schema({
    name:               String,
    fbId:               String,
    profilePic:         String,
    coverPic:           String,
    email:              String,
    fbLink:             String,
    
    bio:                String,
    shortDescription:   String,
    longDescription:    String,
    personalInfo:       String,
    awards:             String,
    website:            String,
    
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event"
        }
    ]
});

module.exports = mongoose.model("Competition",competitionSchema);