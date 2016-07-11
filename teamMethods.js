var mongoose    = require("mongoose"),
    request     = require("request"),
    Event       = require("./models/event"),
    Team        = require("./models/team");

//CONFIDENTIAL APP TOKENS 
var secret = "2a3058e3435b71c77c50bec7302dcff8",
    app_id = "263412864027390",
    token = app_id + '|' + secret;

// Creates a Team object with: name, id, image, and description (except events for now)
// To be implemented: event population function
// pageId : the pageId of the team to be initialized
function initializeTeam(pageId){
    request("https://graph.facebook.com/" + pageId + "?fields=name,id,cover,emails,link,bio,description,about,personal_info,general_info,awards&access_token=" + token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var infoJson = JSON.parse(body);
            request("https://graph.facebook.com/" + pageId + "/photos?fields=images&access_token="+ token, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    var profilePicJson = JSON.parse(body);
                    request("https://graph.facebook.com/" + infoJson["cover"]["id"] + "?fields=webp_images&access_token=" + token, function(error, response, body){
                        if (!error && response.statusCode == 200) {
                            var coverPicJson = JSON.parse(body);
                            
                            var name                = infoJson["name"],
                                fbId                = infoJson["id"],
                                coverPic            = coverPicJson["webp_images"][0]["source"],
                                email               = infoJson["emails"],
                                fbLink              = infoJson["link"],
                                bio                 = infoJson["bio"],
                                longDescription     = infoJson["description"],
                                shortDescription    = infoJson["about"],
                                personalInfo        = infoJson["personal_info"],
                                generalInfo         = infoJson["general_info"],
                                awards              = infoJson["awards"],
                                profilePic          = profilePicJson["data"][0]["images"][0]["source"];
                            
                            var newTeam = {
                                name                : name,
                                fbId                : fbId,
                                coverPic            : coverPic,
                                email               : email,
                                fbLink              : fbLink,
                                bio                 : bio,
                                longDescription     : longDescription,
                                shortDescription    : shortDescription,
                                personalInfo        : personalInfo,
                                generalInfo         : generalInfo,
                                awards              : awards,
                                profilePic          : profilePic
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

// createEvent takes an eventID and returns an Event object
// 'category' and 'posts' properties have yet to be initialized
function createEvent(eventId,callback){
    request("https://graph.facebook.com/" + eventId + "?fields=name,cover,owner,description,place,start_time,end_time,attending_count,declined_count,interested_count,maybe_count,feed,updated_time&access_token=" + token, function (error, response, body){
        if (!error && response.statusCode == 200) {
            var eventJson = JSON.parse(body);
            request("https://graph.facebook.com/" + eventJson["cover"]["id"] + "?fields=webp_images&access_token=" + token, function(error, response, body){
                if (!error && response.statusCode == 200) {
                    var coverJson = JSON.parse(body);
                    
                    var name            = eventJson["name"],
                        cover           = coverJson["webp_images"][1]["source"],
                        hostName        = eventJson["owner"]["name"],
                        hostId          = eventJson["owner"]["id"],
                        description     = eventJson["description"],
                        place           = eventJson["place"]["name"],
                        startTime       = eventJson["start_time"],
                        endTime         = eventJson["end_time"],
                        attendingCount  = eventJson["attending_count"],
                        declinedCount   = eventJson["declined_count"],
                        interestedCount = eventJson["interested_count"],
                        maybeCount      = eventJson["maybe_count"],
                        updatedTime     = eventJson["updated_time"];
                    
                    var newEvent = {
                        name            : name,
                        cover           : cover,
                        fbId            : eventId,
                        hostName        : hostName,
                        hostId          : hostId,
                        description     : description,
                        place           : place,
                        startTime       : startTime,
                        endTime         : endTime,
                        attendingCount  : attendingCount,
                        declinedCount   : declinedCount,
                        interestedCount : interestedCount,
                        maybeCount      : maybeCount,
                        updatedTime     : updatedTime
                    };
                    
                    callback(newEvent);
                    
                } else {
                     console.log("Unsuccessful Cover Photo Graph API call");
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

function createPost(postId){
    
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
    createEvent     : createEvent,
    initializeTeam  : initializeTeam,
    deleteAllTeams  : deleteAllTeams,
    deleteTeam      : deleteTeam
};