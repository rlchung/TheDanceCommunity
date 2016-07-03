var mongoose    = require("mongoose"),
    request     = require("request"),
    Event       = require("./models/event"),
    Team        = require("./models/team");

//CONFIDENTIAL APP TOKENS 
var secret = "2a3058e3435b71c77c50bec7302dcff8",
    app_id = "263412864027390",
    token = app_id + '|' + secret;

// Contains key-value pairs of given teams and their page_id
var team_dir = {
    aca : "acahiphop",
    chaotic_3: "chaoticthree",
    foundations: "FoundationsChoreo",
    grv : "GRVdnc",
    hall_of_fame: "349717898382614",
    maker_empire: "MakerEmpire",
    the_mob: "MobbinSince2013",
    nsu_modern: "1420546741605580",
    samahang_modern : "samahangmodern",
    vsu_modern : "vsumodern"
    
}

function tester(){ 
    // request("https://graph.facebook.com/" + team_dir.Samahang + "?fields=name,id,bio&access_token=" + token, function (error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //         var info_json = JSON.parse(body);
    //         request("https://graph.facebook.com/samahangmodern/photos?fields=images&access_token="+ token, function (error, response, body){
    //             if (!error && response.statusCode == 200) {
    //                 var images_json = JSON.parse(body);
                    
    //                 var name    = info_json["name"],
    //                     id      = info_json["id"],
    //                     bio     = info_json["bio"],
    //                     image   = images_json["data"][0]["images"][0]["source"];
                    
    //                 var newTeam = {
    //                     name : name,
    //                     id : id,
    //                     image : image,
    //                     description : bio
    //                 }
                    
    //                 console.log(name);
    //                 console.log(id);
    //                 console.log(bio);
    //                 console.log(image);
    //             } 
    //         });
    //     }
    // });
};

// Creates a Team object with: name, id, image, and description (except events for now)
// To be implemented: event population function
// page_id : the page_id of the team to be initialized
function initialize_team(page_id){
    request("https://graph.facebook.com/" + page_id + "?fields=name,id,bio&access_token=" + token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info_json = JSON.parse(body);
            request("https://graph.facebook.com/samahangmodern/photos?fields=images&access_token="+ token, function (error, response, body){
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
                    
                    Team.create(newTeam, function(error, newlyCreated){
                        if(error){
                            console.log("Error with creating new Team");
                        } else {
                            console.log(newlyCreated);
                            console.log("Successfully created " + name + " team object");
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