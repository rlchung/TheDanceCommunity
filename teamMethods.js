var mongoose        = require("mongoose"),
    request         = require("request"),
    Team            = require("./models/team"),
    Credentials     = require("./credentials");

// Creates a Team object with: name, id, image, and description (except events for now)
// pageId : the pageId of the team to be initialized
function initializeTeam(pageId){
    request("https://graph.facebook.com/" + pageId + "?fields=name,id,cover,emails,link,bio,description,about,personal_info,general_info,awards,events&access_token=" + Credentials.token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var infoJson = JSON.parse(body);
            request("https://graph.facebook.com/" + pageId + "/photos?fields=images&access_token="+ Credentials.token, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    var profilePicJson = JSON.parse(body);
                    request("https://graph.facebook.com/" + infoJson["cover"]["id"] + "?fields=webp_images&access_token=" + Credentials.token, function(error, response, body){
                        if (!error && response.statusCode == 200) {
                            var coverPicJson = JSON.parse(body);
                            
                            var name                = infoJson["name"],
                                fbId                = infoJson["id"],
                                profilePic          = profilePicJson["data"][0]["images"][0]["source"],
                                coverPic            = coverPicJson["webp_images"][0]["source"],
                                email               = infoJson["emails"],
                                fbLink              = infoJson["link"],
                                bio                 = infoJson["bio"],
                                longDescription     = infoJson["description"],
                                shortDescription    = infoJson["about"],
                                personalInfo        = infoJson["personal_info"],
                                generalInfo         = infoJson["general_info"],
                                awards              = infoJson["awards"],
                                events              = [];
                            
                            var newTeam = {
                                name                : name,
                                fbId                : fbId,
                                profilePic          : profilePic,
                                coverPic            : coverPic,
                                email               : email,
                                fbLink              : fbLink,
                                bio                 : bio,
                                longDescription     : longDescription,
                                shortDescription    : shortDescription,
                                personalInfo        : personalInfo,
                                generalInfo         : generalInfo,
                                awards              : awards,
                                events              : events
                            };
                            
                            infoJson["events"]["data"].forEach(function(event){
                                newTeam.events.push(event["id"]);
                            });
                            
                            Team.create(newTeam, function(error, newlyCreated){
                                if(error){
                                    console.log("Error with creating Team object");
                                    console.log("Error:" + error);
                                } else {
                                    console.log(newlyCreated);
                                    console.log("Successfully created " + newTeam.name + " team object");
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
function deleteAllTeams(){
    Team.remove({},function(error){
        if(error){
            console.log(error);
        } else {
            console.log("Removed all Team Objects from Database");
        }
    });
};

// Deletes a given team from the database
function deleteTeam(pageId){
    Team.findOneAndRemove({fbId:pageId},function(error, teamObj){
        if(error){
            console.log(error);
        // if teamObj exists 
        } if(teamObj){
            console.log("Removed " + pageId + " successfully");
        } else {
            console.log(pageId + " DOES NOT EXIST");
        }
    });
};

module.exports = {
    initializeTeam  : initializeTeam,
    deleteAllTeams  : deleteAllTeams,
    deleteTeam      : deleteTeam
};