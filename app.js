var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    session         = require("express-session"),
    async           = require("async"),
    cloudinary      = require("cloudinary"),
    Event           = require("./models/event"),
    EventMethods    = require("./methods/eventMethods"),
    Team            = require("./models/team"),
    TeamMethods     = require("./methods/teamMethods"),
    seedDB          = require("./seed"),
    restartData     = require("./restartData"),
    Locality        = require("./locality"),
    Directories     = require("./directories"),
    Credentials     = require("./credentials"),
    natural         = require("natural"),
    classifier      = new natural.BayesClassifier();
    // Have yet to implement
    // User        = require('./models/user'); 

var indexRoutes     = require("./routes/index"),
    teamsRoutes     = require("./routes/teams");

// mongoose.connect("mongodb://localhost/thedancecommunity");
mongoose.connect("mongodb://admin:theyear20xx@ds047166.mlab.com:47166/thedancecommunity");
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

cloudinary.config({
    cloud_name: Credentials.cloud_name,
    api_key: Credentials.cloud_api_key,
    api_secret: Credentials.cloud_api_secret
});

// seedDB();
// restartData();

// Team.findByFbId(Directories.teamFbIdDirectory.samahangModern).exec(function(err,team){
//     if(err) console.log(err);
//     else TeamMethods.updateTeam(team[0]._id);
// })

app.use(function(req, res, next) {
   res.locals.url   = req.originalUrl;
   next();
});

app.use(indexRoutes);
app.use(teamsRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server is running");
});

