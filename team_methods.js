var mongoose    = require("mongoose"),
    request     = require("request"),
    Event       = require("./models/event"),
    Team        = require("./models/team");
    
var secret = "2a3058e3435b71c77c50bec7302dcff8",
    app_id = "263412864027390",
    token = app_id + '|' + secret;

function teamTest(){ 
    request('https://graph.facebook.com/545398148962340?fields=events.limit(1)&access_token=' + token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body) // Show the HTML for the Google homepage. 
        }
    });
}

module.exports = teamTest;