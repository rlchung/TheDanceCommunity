var express = require("express"),
    Team    = require("../models/team"),
    Event   = require("../models/event"),
    router  = express.Router();

router.get("/teams", function(req,res){
    Team.find({},function(err,teamsFromDB){
        if(err){
            console.log(err);
        } else {
            res.render("teams/directory",{teams:teamsFromDB});
        }
    });
});

router.get("/teams/:teamId", function(req,res){
    Team.findById(req.params.teamId).populate("events").exec(function(err,foundTeam){
        if(err){
            console.log(err);
        } else {
            res.render("teams/show",{team:foundTeam});
        }
    });
});

router.get("/teams/:teamId/:eventId", function(req,res){
    Event.findById(req.params.eventId, function(err,foundEvent){
        if(err){
            console.log(err);
        } else {
            res.render("events/show",{event:foundEvent});
        }
    });
});

module.exports = router;