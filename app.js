var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    Event           = require("./models/event"),
    EventMethods    = require("./eventMethods"),
    Team            = require("./models/team"),
    TeamMethods     = require("./teamMethods"),
    Post            = require("./models/post");
    // Have yet to implement
    // User        = require('./models/user'); 
    
// Contains key-value pairs of given teams and their page_id
var teamDir = {
    aca: "75035611936",
    chaotic3: "124327507658376",
    foundations: "277137469077279",
    grv: "141226349256771",
    hallOfFame: "349717898382614",
    makerEmpire: "180722678616577",
    theMob: "435120296549776",
    nsuModern: "1420546741605580",
    samahangModern: "545398148962340",
    vsuModern: "578630488962319"
};

var compDir = {
    bodyRock: 199437836735186,
    bridge: 361879750609377,
    fusion: 184822451538010,
    maxtOut: 237658223056509,
    preludeNorcal: 537913236272817,
    ultimateBrawl: 381738788513134,
    vibe: 122754417784582
};

mongoose.connect("mongodb://localhost/thedancecommunity");
// To parse form data
app.use(bodyParser.urlencoded({extended:true}));
// Sets view engine for ejs files
app.set("view engine", "ejs");

// EventMethods.initializeEvent("1079104932155214");
// EventMethods.deleteEvent("1079104932155214");
// EventMethods.deleteAllEvents();
// TeamMethods.initializeTeam(teamDir.samahangModern);
// TeamMethods.initializeTeam(teamDir.aca);
// TeamMethods.deleteTeam(teamDir.aca);
// TeamMethods.deleteAllTeams();

app.get("/", function(req,res){
    res.render("landing"); 
});

app.get("/local", function(req,res){
    res.render("local");
});

app.get("/los-angeles", function(req,res){
    res.render("los-angeles");
});

app.get("/cities", function(req,res){
    var location = req.query.location; 
    // use res.redirect to process location input and redirect to page
    res.send("address is="+ location);
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server is running");
});