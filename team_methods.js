var mongoose    = require("mongoose"),
    request     = require("request"),
    Event       = require("./models/event"),
    Team        = require("./models/team");

//CONFIDENTIAL APP TOKENS 
var secret = "2a3058e3435b71c77c50bec7302dcff8",
    app_id = "263412864027390",
    token = app_id + '|' + secret;

function tester(page_id){ 
    request("https://graph.facebook.com/" + page_id + "?fields=name,id,cover,emails,link,bio,description,about,personal_info,general_info,awards&access_token=" + token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info_json = JSON.parse(body);
            request("https://graph.facebook.com/" + page_id + "/photos?fields=images&access_token="+ token, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    var images_json = JSON.parse(body);
                    
                    var name                = info_json["name"],
                        id                  = info_json["id"],
                        cover_pic           = info_json["cover"]["source"],
                        email               = info_json["emails"],
                        fb_link             = info_json["link"],
                        bio                 = info_json["bio"],
                        long_description    = info_json["description"],
                        short_description   = info_json["about"],
                        personal_info       = info_json["personal_info"],
                        general_info        = info_json["general_info"],
                        awards              = info_json["awards"],
                        profile_pic         = images_json["data"][0]["images"][0]["source"];
                    
                    var newTeam = {
                        name                : name,
                        id                  : id,
                        cover_pic           : cover_pic,
                        email               : email,
                        fb_link             : fb_link,
                        bio                 : bio,
                        long_description    : long_description,
                        short_description   : short_description,
                        personal_info       : personal_info,
                        general_info        : general_info,
                        awards              : awards,
                        profile_pic         : profile_pic
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
    request("https://graph.facebook.com/" + page_id + "?fields=name,id,cover,emails,link,bio,description,about,personal_info,general_info,awards&access_token=" + token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info_json = JSON.parse(body);
            request("https://graph.facebook.com/" + page_id + "/photos?fields=images&access_token="+ token, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    var images_json = JSON.parse(body);
                    
                    var name                = info_json["name"],
                        id                  = info_json["id"],
                        cover_pic           = info_json["cover"]["source"],
                        email               = info_json["emails"],
                        fb_link             = info_json["link"],
                        bio                 = info_json["bio"],
                        long_description    = info_json["description"],
                        short_description   = info_json["about"],
                        personal_info       = info_json["personal_info"],
                        general_info        = info_json["general_info"],
                        awards              = info_json["awards"],
                        profile_pic         = images_json["data"][0]["images"][0]["source"];
                    
                    var newTeam = {
                        name                : name,
                        id                  : id,
                        cover_pic           : cover_pic,
                        email               : email,
                        fb_link             : fb_link,
                        bio                 : bio,
                        long_description    : long_description,
                        short_description   : short_description,
                        personal_info       : personal_info,
                        general_info        : general_info,
                        awards              : awards,
                        profile_pic         : profile_pic
                    };
                    
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

// Deletes all teams from database
function delete_all_teams(){
    Team.remove({},function(error){
        if(error){
            console.log(error);
        } else {
            console.log("Removed all Team Objects from Database");
        }
    });
};

// Deletes a given team from the database
function delete_team(page_id){
    Team.remove({id:page_id},function(error){
        if(error){
            console.log(error);
        } else {
            console.log("Removed " + page_id + " successfully");
        }
    });
};

module.exports = {
    tester : tester,
    initialize_team : initialize_team,
    delete_all_teams : delete_all_teams,
    delete_team : delete_team
};