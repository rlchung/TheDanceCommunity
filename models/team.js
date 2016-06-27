var mongoose = require("mongoose");

// SCHEMA SETUP FOR DANCE TEAM OBJECT
var teamSchema = new mongoose.Schema({
    name:           String,
    id:             String,
    image:          String,
    description:    String,
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event"
        }
    ]
});

module.exports = mongoose.model("Team", teamSchema);