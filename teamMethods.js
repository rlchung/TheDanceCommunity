var mongoose        = require("mongoose"),
    request         = require("request"),
    async           = require("async"),
    Event           = require("./models/event"),
    Team            = require("./models/team"),
    Credentials     = require("./credentials"),
    EventMethods    = require("./eventMethods");

// Creates a Team object and adds to DB
// pageId : the pageId of the team to be initialized
function initializeTeam(pageId){
    request("https://graph.facebook.com/" + pageId + "?fields=name,id,cover,emails,link,bio,description,about,personal_info,general_info,awards,events&access_token=" + Credentials.token, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            var infoJson = JSON.parse(body);
            request("https://graph.facebook.com/" + pageId + "/photos?fields=images&access_token="+ Credentials.token, function (err, response, body){
                if (!err && response.statusCode == 200) {
                    var profilePicJson = JSON.parse(body);
                    request("https://graph.facebook.com/" + infoJson["cover"]["id"] + "?fields=webp_images&access_token=" + Credentials.token, function(err, response, body){
                        if (!err && response.statusCode == 200) {
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
                            
                            // An array of event fbId's that will be used to initialize Events belonging to Team obj
                            var eventIdArray = [];
                            
                            infoJson["events"]["data"].forEach(function(event){
                                eventIdArray.push(event["id"]);
                            });
                            
                            // An object containing newTeam and eventIdArray
                            var teamContainer = {
                                newTeam         : newTeam,
                                eventIdArray    : eventIdArray
                            };
                            
                            finalizeTeam(teamContainer);
                            
                        } else {
                            console.log("Unsuccessful Graph API call to photos");
                            console.log("Error: " + err + "\n" + 
                                        "Response: " + response + "\n" +
                                        "Response Status Code: " + response.statusCode);
                        }
                    });
                } else {
                    console.log("Unsuccessful Graph API call to photos");
                    console.log("Error: " + err + "\n" + 
                                "Response: " + response + "\n" +
                                "Response Status Code: " + response.statusCode);
                }
            });
        } else {
            console.log("Unsuccessful Graph API call");
            console.log("Error: " + err + "\n" + 
                        "Response: " + response + "\n" +
                        "Response Status Code: " + response.statusCode);
        }
    });
};

function finalizeTeam(teamContainer){
    async.each(teamContainer.eventIdArray,function(id,callback){
        EventMethods.initializeEvent(id,function(event){
            teamContainer.newTeam.events.push(event._id);
            callback();
        });
    }, function(err){
        if(err)
            console.log(err);
        else {
            Team.create(teamContainer.newTeam, function(err, newlyCreated){
                if(err){
                    console.log("Error with creating Team object");
                    console.log("Error:" + err);
                } else {
                    console.log(newlyCreated);
                    console.log("Successfully created " + teamContainer.newTeam.name + " team object");
                }
            });
        }
    });
}

// Deletes all teams from database
function deleteAllTeams(){
    Team.remove({},function(err){
        if(err){
            console.log(err);
        } else {
            console.log("Removed all Team Objects from Database");
        }
    });
};

// Deletes a given team from the database
function deleteTeam(pageId){
    Team.findOneAndRemove({fbId:pageId},function(err, teamObj){
        if(err){
            console.log(err);
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