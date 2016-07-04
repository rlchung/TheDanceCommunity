var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    Event           = require("./models/event"),
    Team            = require("./models/team"),
    team_methods    = require("./team_methods");
    // Have yet to implement
    // User        = require('./models/user'); 
    
// Contains key-value pairs of given teams and their page_id
var team_dir = {
    aca: "75035611936",
    chaotic_3: "124327507658376",
    foundations: "277137469077279",
    grv: "141226349256771",
    hall_of_fame: "349717898382614",
    maker_empire: "180722678616577",
    the_mob: "435120296549776",
    nsu_modern: "1420546741605580",
    samahang_modern: "545398148962340",
    vsu_modern: "578630488962319"
};

var comp_dir = {
    body_rock: 199437836735186,
    bridge: 361879750609377,
    fusion: 184822451538010,
    maxt_out: 237658223056509,
    prelude_norcal: 537913236272817,
    ultimate_brawl: 381738788513134,
    vibe: 122754417784582
};

mongoose.connect("mongodb://localhost/thedancecommunity");
// To parse form data
app.use(bodyParser.urlencoded({extended:true}));
// Sets view engine for ejs files
app.set("view engine", "ejs");

// team_methods.delete_all_teams();
team_methods.tester(team_dir.foundations);
// team_methods.initialize_team("acahiphop");
// team_methods.delete_team(team_dir.aca);

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