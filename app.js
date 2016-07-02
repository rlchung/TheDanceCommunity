var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    Event           = require("./models/event"),
    Team            = require("./models/team"),
    team_methods    = require("./team_methods");
    // Have yet to implement
    // User        = require('./models/user'); 

mongoose.connect("mongodb://localhost/thedancecommunity");
// To parse form data
app.use(bodyParser.urlencoded({extended:true}));
// Sets view engine for ejs files
app.set("view engine", "ejs");

team_methods.initialize_team();

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