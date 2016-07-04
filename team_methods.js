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

function tester(page_id){ 
    request("https://graph.facebook.com/" + page_id + "?fields=name,id,emails,link,bio,description,about,personal_info,general_info,awards&access_token=" + token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info_json = JSON.parse(body);
            request("https://graph.facebook.com/" + page_id + "/photos?fields=images&access_token="+ token, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    var images_json = JSON.parse(body);
                    
                    var name                = info_json["name"],
                        id                  = info_json["id"],
                        email               = info_json["emails"],
                        fb_link             = info_json["link"],
                        bio                 = info_json["bio"],
                        description         = info_json["description"],
                        short_description   = info_json["about"],
                        personal_info       = info_json["personal_info"],
                        general_info        = info_json["general_info"],
                        awards              = info_json["awards"],
                        image               = images_json["data"][0]["images"][0]["source"];
                    
                    var newTeam = {
                        name                : name,
                        id                  : id,
                        email               : email,
                        fb_link             : fb_link,
                        bio                 : bio,
                        description         : description,
                        short_description   : short_description,
                        personal_info       : personal_info,
                        general_info        : general_info,
                        awards              : awards,
                        image               : image
                    }
                    
                    
                    for (var property in newTeam) {
                        if (newTeam.hasOwnProperty(property)){
                            console.log(property + ": " + newTeam[property] + "\n");
                        }
                    }
                } else {
                    console.log("Unsuccessful Graph API call to photos");
                    console.log("Error: " + error + "\n" + 
                                "Response: " + response + "\n" +
                                "Response Status Code: " + response.statusCode);
                }
            });
        } else {
            console.log("Unsuccessful Graph API call");
            console.log("Error: " + error + "\n" + 
                        "Response: " + response + "\n" +
                        "Response Status Code: " + response.statusCode);
        }
    });
};

// Creates a Team object with: name, id, image, and description (except events for now)
// To be implemented: event population function
// page_id : the page_id of the team to be initialized
function initialize_team(page_id){
    request("https://graph.facebook.com/" + page_id + "?fields=name,id,emails,link,bio,description,about,personal_info,general_info,awards&access_token=" + token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info_json = JSON.parse(body);
            request("https://graph.facebook.com/" + page_id + "/photos?fields=images&access_token="+ token, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    var images_json = JSON.parse(body);
                    
                    var name                = info_json["name"],
                        id                  = info_json["id"],
                        email               = info_json["emails"],
                        fb_link             = info_json["link"],
                        bio                 = info_json["bio"],
                        description         = info_json["description"],
                        short_description   = info_json["about"],
                        personal_info       = info_json["personal_info"],
                        general_info        = info_json["general_info"],
                        awards              = info_json["awards"],
                        image               = images_json["data"][0]["images"][0]["source"];
                    
                    var newTeam = {
                        name                : name,
                        id                  : id,
                        email               : email,
                        fb_link             : fb_link,
                        bio                 : bio,
                        description         : description,
                        short_description   : short_description,
                        personal_info       : personal_info,
                        general_info        : general_info,
                        awards              : awards,
                        image               : image
                    }
                    
                    Team.create(newTeam, function(error, newlyCreated){
                        if(error){
                            console.log("Error with creating Team object");
                        } else {
                            console.log(newlyCreated);
                            console.log("Successfully created " + name + " team object");
                        }
                    });
                } else {
                    console.log("Unsuccessful Graph API call to photos");
                    console.log("Error: " + error + "\n" + 
                                "Response: " + response + "\n" +
                                "Response Status Code: " + response.statusCode);
                }
            });
        } else {
            console.log("Unsuccessful Graph API call");
            console.log("Error: " + error + "\n" + 
                        "Response: " + response + "\n" +
                        "Response Status Code: " + response.statusCode);
        }
    });
};

// Removes all teams from database
function delete_teams(){
    Team.remove({},function(error){
        if(error){
            console.log(error);
        } else {
            console.log("Removed all Team Objects from Database");
        }
    });
};

module.exports = {
    tester : tester,
    initialize_team : initialize_team,
    delete_teams : delete_teams
};