var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    session         = require("express-session"),
    async           = require("async"),
    Event           = require("./models/event"),
    EventMethods    = require("./methods/eventMethods"),
    Team            = require("./models/team"),
    TeamMethods     = require("./methods/teamMethods"),
    seedDB          = require("./seed"),
    restartData     = require("./restartData"),
    Locality        = require("./locality"),
    Directories     = require("./directories"),
    natural         = require("natural"),
    classifier      = new natural.BayesClassifier();
    // Have yet to implement
    // User        = require('./models/user'); 

mongoose.connect("mongodb://localhost/thedancecommunity");
// To parse form data
app.use(bodyParser.urlencoded({extended:true}));
// Sets view engine for ejs files
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(session({
    secret: 'theyear20xx',
    resave: false,
    saveUninitialized: false
}));

// seedDB();
// restartData();

// Team.findByFbId(Directories.teamFbIdDirectory.samahangModern).exec(function(err,team){
//     if(err) console.log(err);
//     else TeamMethods.updateTeam(team[0]._id);
// })

app.get("/", function(req,res){
    res.render("landing"); 
});

// team routes

app.get("/teams", function(req,res){
    Team.find({},function(err,teamsFromDB){
        if(err){
            console.log(err);
        } else {
            res.render("teams/directory",{teams:teamsFromDB});
        }
    });
});

app.get("/teams/:teamId", function(req,res){
    Team.findById(req.params.teamId).populate("events").exec(function(err,foundTeam){
        if(err){
            console.log(err);
        } else {
            res.render("teams/show",{team:foundTeam});
        }
    });
});

// event route

app.get("/teams/:teamId/:eventId", function(req,res){
    Event.findById(req.params.eventId, function(err,foundEvent){
        if(err){
            console.log(err);
        } else {
            res.render("events/show",{event:foundEvent});
        }
    })
})

// index to cities routes version 1
var cityFunction = function(req,res){
    var formattedNearbyCity0 = req.session.nearby.formattedNearbyCity0;
    var formattedNearbyCity1 = req.session.nearby.formattedNearbyCity1;
    var formattedNearbyCity2 = req.session.nearby.formattedNearbyCity2;

    
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
                    console.log(teamsFromDB);
                    res.render("local", {
                        nearby: req.session.nearby,
                        location: req.session.userLocation,
                        teams: teamsFromDB
                    });    
                }
            });
        }
    });
}

// index to cities routes version 2 
var cityFunction2 = function(req,res){
    
    var formattedNearbyCity0;
    var formattedNearbyCity1;
    var formattedNearbyCity2;
    
    if(typeof req.session.nearby == 'undefined'){
        Locality.geocodeAddress(req.params.baseCity,function(coordinates){
            Locality.nearestCommunity(coordinates,function(community){
                req.session.nearby = community;
                formattedNearbyCity0 = community.formattedNearbyCity0;
                formattedNearbyCity1 = community.formattedNearbyCity1;
                formattedNearbyCity2 = community.formattedNearbyCity2;
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
                                    nearby: req.session.nearby,
                                    location: req.session.userLocation,
                                    teams: teamsFromDB
                                });    
                            }
                        });
                    }
                });
            });
            
        });
    } else {
        formattedNearbyCity0 = req.session.nearby.formattedNearbyCity0;
        formattedNearbyCity1 = req.session.nearby.formattedNearbyCity1;
        formattedNearbyCity2 = req.session.nearby.formattedNearbyCity2;
    
    
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
                            nearby: req.session.nearby,
                            location: req.session.userLocation,
                            teams: teamsFromDB
                        });    
                    }
                });
            }
        });
    }
}

app.get("/cities/:baseCity", cityFunction2);

app.get("/cities", function(req,res){
    var location = req.query.location; 
    // use res.redirect to process location input and redirect to page
    Locality.geocodeAddress(location, function(inputCoordinates){
        //res.redirect("/cities/" + community);
        Locality.nearestCommunity(inputCoordinates,function(community){
            //use cookies to store values for nearby functionality
            req.session.userLocation = location;
            req.session.nearby = community;
            res.redirect("/cities/" + community.baseCity);
        });
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server is running");
});

