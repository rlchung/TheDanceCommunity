var mongoose    = require("mongoose"),
    request     = require("request"),
    Event       = require("./models/event"),
    Team        = require("./models/team");

//CONFIDENTIAL APP TOKENS 
var secret = "2a3058e3435b71c77c50bec7302dcff8",
    app_id = "263412864027390",
    token = app_id + '|' + secret;

function tester(){ 
    request('https://graph.facebook.com/samahangmodern?fields=name,id,bio&access_token=' + token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info_json = JSON.parse(body);
            request('https://graph.facebook.com/samahangmodern/photos?fields=images&access_token='+ token, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    var images_json = JSON.parse(body);
                    
                    var name    = info_json["name"],
                        id      = info_json["id"],
                        bio     = info_json["bio"],
                        image   = images_json["data"][0]["images"][0]["source"];
                    
                    var newTeam = {
                        name : name,
                        id : id,
                        image : image,
                        description : bio
                    }
                    
                    console.log(name);
                    console.log(id);
                    console.log(image);
                    console.log(bio);
                }
            });
        }
    });
};

// Creates a Team object with all necessary parameters (except events for now)
// To be implemented: event population function 
function initialize_team(){
    request('https://graph.facebook.com/samahangmodern?fields=name,id,bio&access_token=' + token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info_json = JSON.parse(body);
            request('https://graph.facebook.com/samahangmodern/photos?fields=images&access_token='+ token, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    var images_json = JSON.parse(body);
                    
                    var name    = info_json["name"],
                        id      = info_json["id"],
                        bio     = info_json["bio"],
                        image   = images_json["data"][0]["images"][0]["source"];
                    
                    var newTeam = {
                        name : name,
                        id : id,
                        image : image,
                        description : bio
                    }
                    
                    // console.log(name);
                    // console.log(id);
                    // console.log(image);
                    // console.log(bio);
                    
                    Team.create(newTeam, function(error, newlyCreated){
                        if(error){
                            console.log("Error with created new Team");
                        } else {
                            console.log(newlyCreated);
                            console.log("successfully created " + name + " team object");
                        }
                    });
                } 
            });
        }
    });
};

module.exports = {
    tester : tester,
    initialize_team : initialize_team
};