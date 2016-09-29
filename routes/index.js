var express     = require("express"),
    router      = express.Router(),
    async       = require("async"),
    Locality    = require("../locality"),
    Team        = require("../models/team");

// cityFunciton is a function that, for a given baseCity, searches the nearest 3 communities and renders the local page
var cityFunction = function(req,res){
    Locality.geocodeAddress(req.params.baseCity,function(coordinates){
        Locality.nearbyCommunities(coordinates,function(community){
            var formattedNearbyCity0 = community.formattedNearbyCity0;
            var formattedNearbyCity1 = community.formattedNearbyCity1;
            var formattedNearbyCity2 = community.formattedNearbyCity2;
            Team.find({location: {$in:[formattedNearbyCity0, formattedNearbyCity1, formattedNearbyCity2]}}).populate('events').exec(function(err,teamsFromDB){
                if(err)
                    console.log(err);
                else {
                    // update each team
                    async.each(teamsFromDB, function(team, callback){
                        // TeamMethods.updateTeam(team._id);
                        callback();
                    }, function(err){
                        if(err){
                            console.log("Failed to update teams");
                        } else {
                            res.render("local", {
                                teams: teamsFromDB
                            }); 
                        }
                    });
                }
            });
        });
    });
}

// ROOT ROUTE
router.get("/", function(req,res){
    res.render("landing"); 
});

// about route
router.get("/about",function(req,res){
    res.render("about");
});

// route used by indexed city links to render local page
router.get("/cities/:baseCity",cityFunction);

// route used by search box to render local page
router.get("/nearby/:baseCity",cityFunction);

// finds the nearest community based on the user's search
router.get("/search",function(req,res){
    var location = req.query.location;
    Locality.geocodeAddress(location,function(inputCoordinates){
        Locality.nearestCommunity(inputCoordinates,function(community){
            res.redirect("/nearby/" + community);
        });
    });
});

module.exports = router;