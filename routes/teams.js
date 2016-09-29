var express = require("express"),
    async   = require("async"),
    Team    = require("../models/team"),
    Event   = require("../models/event"),
    TeamMethods = require("../methods/teamMethods"),
    router  = express.Router();

router.get("/teams", function(req,res){
    Team.find({},function(err,teamsFromDB){
        if(err){
            console.log(err);
        } else {
            // update each team
            async.each(teamsFromDB, function(team, callback){
                TeamMethods.updateTeam(team._id);
                callback();
            }, function(err){
                if(err){
                    console.log("Failed to update teams");
                    res.render("teams/directory",{teams:teamsFromDB});
                } else {
                    res.render("teams/directory",{teams:teamsFromDB});
                }
            });
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