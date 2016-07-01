var mongoose    = require("mongoose"),
    request     = require("request"),
    Event       = require("./models/event"),
    Team        = require("./models/team");

//CONFIDENTIAL APP TOKENS 
var secret = "2a3058e3435b71c77c50bec7302dcff8",
    app_id = "263412864027390",
    token = app_id + '|' + secret;

function teamTest(){ 
    request('https://graph.facebook.com/samahangmodern?fields=name,id,bio&access_token=' + token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var body1 = JSON.parse(body);
            request('https://graph.facebook.com/samahangmodern/photos?fields=images&access_token='+ token, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    var body2 = JSON.parse(body);
                    console.log(body1["name"]); //logs out the name of body1
                    console.log(body1["id"]);
                    console.log(body2["data"][0]["images"][0]["source"]); //logs out the url of the full image
                    console.log(body1["bio"]);
                } 
            });
        }
    });
}

// Creates a Team object with all necessary parameters (except events for now)
// To be implemented: event population function 
function intialize_Team(){
    request('https://graph.facebook.com/samahangmodern?fields=name,id,bio&access_token=' + token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info_json = JSON.parse(body);
            request('https://graph.facebook.com/samahangmodern/photos?fields=images&access_token='+ token, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    var images_json = JSON.parse(body);
                    
                    var name    = info_json["name"],
                        id      = info_json["id"],
                        bio     = info_json["bio"],
                        image   = images_json[0]["images"][0]["source"];
                    
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

module.exports = teamTest;