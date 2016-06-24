var express     = require('express'),
    bodyParser  = require('body-parser'),
    app         = express();

// To parse form data
app.use(bodyParser.urlencoded({extended:true}));
// Sets view engine for ejs files
app.set("view engine", "ejs");

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
    var location = req.params('location'); 
    res.send("address is="+ location);
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server is running");
});