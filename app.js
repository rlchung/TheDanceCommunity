var express = require('express'),
    app     = express();

app.set("view engine", "ejs");

app.get("/",function(req,res){
    res.send("HOMEPAGE"); 
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server is running");
});