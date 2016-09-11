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
    Post            = require("./models/post"),
    PostMethods     = require("./methods/postMethods"),
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

// Team.findByFbId(Directories.teamFbIdDirectory.samahangModern).populate('events').exec(function(err,team){
//     if(err) console.log(err);
//     else console.log(team[0]);
// });

app.get("/", function(req,res){
    res.render("landing"); 
});

// event routes
app.get("/cities/:baseCity/:teamId/:eventId", function(req,res){
    Event.findById(req.params.eventId).populate("comments").exec(function(err,foundEvent){
        if(err){
            console.log(err);
        } else {
            console.log(foundEvent);
            res.render("events/show",{event:foundEvent});
        }
    })
})

// index to cities routes
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
                    res.render("local", {
                        coordinates: req.session.coordinates, 
                        nearby: req.session.nearby,
                        location: req.session.userLocation,
                        teams: teamsFromDB
                    });    
                }
            });
        }
    });
}

app.get("/cities/los-angeles", cityFunction);
app.get("/cities/anaheim", cityFunction);
app.get("/cities/irvine", cityFunction);
app.get("/cities/santa-ana", cityFunction);
app.get("/cities/cerritos", cityFunction);
app.get("/cities/monterey-park", cityFunction);
app.get("/cities/walnut", cityFunction);
app.get("/cities/long-beach", cityFunction);
app.get("/cities/west-covina", cityFunction);

app.get("/cities", function(req,res){
    var location = req.query.location; 
    // use res.redirect to process location input and redirect to page
    Locality.geocodeAddress(location, function(inputCoordinates){
        //res.redirect("/cities/" + community);
        Locality.nearestCommunity(inputCoordinates,function(community){
            //use cookies to store coordinate values for nearby functionality
            req.session.coordinates = inputCoordinates;
            req.session.userLocation = location;
            req.session.nearby = community;
            res.redirect("/cities/" + community.baseCity);
        });
    });
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server is running");
});

