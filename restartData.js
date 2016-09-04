var mongoose    = require("mongoose"),
    Team        = require("./models/team"),
    Event       = require("./models/event"),
    Post        = require("./models/post");

function restartData(){
    Team.remove({},function(err){
        if(err) 
            console.log(err);
        else 
            console.log("removed all teams");
    });
    
    Event.remove({},function(err){ 
        if(err) console.log(err);
        else console.log("removed all events");
    });
    
    Post.remove({},function(err){
        if(err) console.log(err);
        else console.log("removed all posts");
    });
}

module.exports = restartData;