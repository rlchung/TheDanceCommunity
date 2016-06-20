var express = require('express'),
    app     = express();

app.set("view engine", "ejs");

app.get("/", function(req,res){
    res.render("landing"); 
});

app.get("/local", function(req,res){
    res.render("local");
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server is running");
});