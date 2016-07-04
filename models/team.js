var mongoose = require("mongoose");

// SCHEMA SETUP FOR DANCE TEAM OBJECT
var teamSchema = new mongoose.Schema({
    name:               String,
    id:                 String,
    image:              String,
    email:              String,
    fb_link:            String,

    bio:                String,
    description:        String,
    short_description:  String,
    personal_info:      String,
    general_info:       String,
    awards:             String,
    
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event"
        }
    ]
});

module.exports = mongoose.model("Team", teamSchema);