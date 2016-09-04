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
    Directories     = require("./directories");
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

// Team.findByFbId(Directories.teamFbIdDirectory.aca).exec(function(err,team){
//     if(err) console.log(err);
//     TeamMethods.updateTeam(team[0]._id);
// });
// TeamMethods.deleteTeam(Directories.teamFbIdDirectory.samahangModern);
// Team.findByFbId(Directories.teamFbIdDirectory.samahangModern).populate('events').exec(function(err,team){
//     if(err) console.log(err);
//     else console.log(team[0]);
// });

app.get("/", function(req,res){
    res.render("landing"); 
});

var cityFunction = function(req,res){
    var formattedNearbyCity0 = req.session.nearby.formattedNearbyCity0;
    var formattedNearbyCity1 = req.session.nearby.formattedNearbyCity1;
    var formattedNearbyCity2 = req.session.nearby.formattedNearbyCity2;
    
    
    Team.find({location: {$in:[formattedNearbyCity0, formattedNearbyCity1, formattedNearbyCity2]}}, function(err,teamsFromDB){
        if(err)console.log(err);
        else {
            res.render("cities/local", {
                coordinates: req.session.coordinates, 
                nearby: req.session.nearby,
                teams: teamsFromDB
            });
        }
    })
}

app.get("/cities/los-angeles", cityFunction);
app.get("/cities/anaheim", cityFunction);
app.get("/cities/irvine", cityFunction);
app.get("/cities/santa-ana", cityFunction);
app.get("/cities/cerritos", cityFunction);
app.get("/cities/monterey-park", cityFunction);
app.get("/cities/walnut", cityFunction);
app.get("/cities/long-beach", cityFunction);

app.get("/cities", function(req,res){
    var location = req.query.location; 
    // use res.redirect to process location input and redirect to page
    Locality.geocodeAddress(location, function(inputCoordinates){
        //res.redirect("/cities/" + community);
        Locality.nearestCommunity(inputCoordinates,function(community){
            //use cookies to store coordinate values for nearby functionality
            req.session.coordinates = inputCoordinates;
            req.session.nearby = community;
            res.redirect("/cities/" + community.baseCity);
        });
    });
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server is running");
});

