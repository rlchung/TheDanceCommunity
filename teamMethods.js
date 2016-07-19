var mongoose    = require("mongoose"),
    request     = require("request"),
    Event       = require("./models/event"),
    Team        = require("./models/team"),
    async       = require("async");

//CONFIDENTIAL APP TOKENS 
var secret = "2a3058e3435b71c77c50bec7302dcff8",
    app_id = "263412864027390",
    token = app_id + '|' + secret;

// Creates a Team object with: name, id, image, and description (except events for now)
// To be implemented: event population function
// pageId : the pageId of the team to be initialized
function initializeTeam(pageId){
    request("https://graph.facebook.com/" + pageId + "?fields=name,id,cover,emails,link,bio,description,about,personal_info,general_info,awards,events&access_token=" + token, function (error, response, body) {
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
                                events              = [],
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
                                events              : events,
                                profilePic          : profilePic
                            };
                            
                            var idArray = [];
                            
                            infoJson["events"]["data"].forEach(function(event){
                                idArray.push(event["id"]);
                            });
                            
                            // An object containing newTeam and idArray
                            var teamContainer = {
                                newTeam : newTeam,
                                idArray : idArray
                            };
                            
                            createTeam(teamContainer);
                            
                            // Team.create(newTeam, function(error, newlyCreated){
                            //     if(error){
                            //         console.log("Error with creating Team object");
                            //     } else {
                            //         console.log(newlyCreated);
                            //         console.log("Successfully created " + name + " team object");
                            //     }
                            // });
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

// @param teamContainer is a obj containing a Team obj and an array of event id's
// createEvents instantiates a Team object
function createTeam(teamContainer){
    // creates an event object for each id in idArray and pushes it into teamContainer.newTeam
    var eventArray = [];
    // teamContainer.idArray.forEach(function(eventId){
    //     createEvent(eventId,function(event){
    //         // teamContainer.newTeam.events.push(eventId);
    //         eventArray.push(event);
    //     });
    // });
    
    async.each(teamContainer.idArray,function(id,callback){
        createEvent(id,function(event){
            teamContainer.newTeam.events.push(event);
            callback();
        });
    }, function(err){
        if (err)
            console.log(err);
        else 
            console.log(teamContainer.newTeam.events);
    });

};

// createEvent takes an eventID and returns an Event object
// 'category' and 'posts' properties have yet to be initialized
function createEvent(eventId,callback){
    request("https://graph.facebook.com/" + eventId + "?fields=name,cover,owner,description,place,start_time,end_time,attending_count,declined_count,interested_count,maybe_count,feed,updated_time&access_token=" + token, function (error, response, body){
        if (!error && response.statusCode == 200) {
            var eventJson = JSON.parse(body);
            
            // additional undefined tests needed
            var placeCheck;
            var coverCheck;
            
            var name            = eventJson["name"],
                hostName        = eventJson["owner"]["name"],
                hostId          = eventJson["owner"]["id"],
                description     = eventJson["description"],
                startTime       = eventJson["start_time"],
                endTime         = eventJson["end_time"],
                attendingCount  = eventJson["attending_count"],
                declinedCount   = eventJson["declined_count"],
                interestedCount = eventJson["interested_count"],
                maybeCount      = eventJson["maybe_count"],
                updatedTime     = eventJson["updated_time"];
                    
            var newEvent = {
                name            : name,
                fbId            : eventId,
                hostName        : hostName,
                hostId          : hostId,
                description     : description,
                startTime       : startTime,
                endTime         : endTime,
                attendingCount  : attendingCount,
                declinedCount   : declinedCount,
                interestedCount : interestedCount,
                maybeCount      : maybeCount,
                updatedTime     : updatedTime
            };
            
            // separate checks needed for possibly undefined nested properties
            if (typeof eventJson["place"] != 'undefined') { 
                placeCheck = eventJson["place"]["name"];
                newEvent.place = placeCheck;
            }
            
            if (typeof eventJson["cover"] != 'undefined') {
                // coverCheck = eventJson["cover"]["id"];
                request("https://graph.facebook.com/" + eventJson["cover"]["id"] + "?fields=webp_images&access_token=" + token, function(error, response, body){
                    if (!error && response.statusCode == 200) {
                        var coverObj = JSON.parse(body);
                        coverCheck = coverObj["webp_images"][1]["source"];
                        newEvent.cover = coverCheck;
                        // callback needs to be nested in request statement for cover to process
                        callback(newEvent);
                    } else {
                         console.log("Unsuccessful Cover Photo Graph API call");
                         console.log("Error: " + error + "\n" + 
                            "Response: " + response + "\n" +
                            "Response Status Code: " + response.statusCode);
                    }
                });
            } else {
                callback(newEvent);
            }
            
        } else {
            console.log("createEvent: Unsuccessful Graph API call");
            console.log("Error: " + error + "\n" + 
                        "Response: " + response + "\n" +
                        "Response Status Code: " + response.statusCode);
        }
        
    });
};

function createPost(postId,callback){
    request("https://graph.facebook.com/" + postId + "?fields=from,message,link,attachments,created_time,updated_time&access_token=" + token, function (error, response, body){
        if(!error && response.statusCode == 200){
            var postJson = JSON.parse(body);
            
            // additional undefined checks needed 
            var attachments = [];    
            
            var user            = postJson["from"]["name"],
                fbId            = postJson["id"],
                message         = postJson["message"],
                link            = postJson["link"],
                created_time    = postJson["created_time"],
                updated_time    = postJson["updated_time"];
                
            var newPost = {
                user            : user,
                fbId            : fbId,
                message         : message,
                link            : link,
                attachments     : attachments,
                created_time    : created_time,
                updated_time    : updated_time
            };
            
            // separate checks needed for possibly undefined nested properties
            if (typeof postJson["attachments"] != 'undefined') { 
                postJson["attachments"]["data"].forEach(function(object){
                    for (var content in object["media"]){
                        newPost.attachments.push(object["media"][content]["src"]);
                    }
                });
            }
            
            callback(newPost);
            
        } else {
            console.log("createPost: Unsuccessful Graph API call");
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
    createTeam      : createTeam,
    createEvent     : createEvent,
    createPost      : createPost,
    initializeTeam  : initializeTeam,
    deleteAllTeams  : deleteAllTeams,
    deleteTeam      : deleteTeam
};