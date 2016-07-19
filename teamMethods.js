var mongoose    = require("mongoose"),
    request     = require("request"),
    Event       = require("./models/event"),
    Team        = require("./models/team"),
    Post        = require("./models/post"),
    Credentials = require("./credentials"),
    async       = require("async");

// Creates a Team object with: name, id, image, and description (except events for now)
// To be implemented: event population function
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
                            
                            var eventIdArray = [];
                            
                            infoJson["events"]["data"].forEach(function(event){
                                eventIdArray.push(event["id"]);
                            });
                            
                            // An object containing newTeam and eventIdArray
                            var teamContainer = {
                                newTeam : newTeam,
                                eventIdArray : eventIdArray
                            };
                            
                            finalizeTeam(teamContainer);
                            
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
// finalizeTeam adds event objects to Team and adds to DB
function finalizeTeam(teamContainer){
    
    async.each(teamContainer.eventIdArray,function(id,callback){
        initializeEvent(id,function(event){
            teamContainer.newTeam.events.push(event);
            callback();
        });
    }, function(err){
        if (err)
            console.log(err);
        else {
            Team.create(teamContainer.newTeam, function(error, newlyCreated){
                if(error){
                    console.log("Error with creating Team object");
                    console.log("Error:" + error);
                } else {
                    console.log(newlyCreated);
                    console.log("Successfully created " + teamContainer.newTeam.name + " team object");
                }
           });
        }
    });
};

// initializeEvent takes an eventID and returns an Event object
// 'category' properties have yet to be initialized
function initializeEvent(eventId,callback){
    request("https://graph.facebook.com/" + eventId + "?fields=name,cover,owner,description,place,start_time,end_time,attending_count,declined_count,interested_count,maybe_count,feed,photos{images},updated_time&access_token=" + Credentials.token, function (error, response, body){
        if (!error && response.statusCode == 200) {
            var eventJson = JSON.parse(body);
            
            // additional undefined tests needed
            var placeCheck;
            var coverCheck;
            
            // newEvent variables
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
                posts           = [],
                photos          = [],
                updatedTime     = eventJson["updated_time"];
                    
            var newEvent = new Event({
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
                posts           : posts,
                photos          : photos,
                updatedTime     : updatedTime
            });
            
            // adds photos to 'photos' array, if any
            if (typeof eventJson["photos"] != 'undefined') {
                eventJson["photos"]["data"].forEach(function(object){
                    newEvent.photos.push(object["images"][0]["source"])
                });
            }
            
            //variables needed for creating posts 
            
            var postIdArray = [];
                            
            eventJson["feed"]["data"].forEach(function(event){
                postIdArray.push(event["id"]);
            });
                            
            // An object containing newEvent and postIdArray
            var eventContainer = {
                newEvent    : newEvent,
                postIdArray : postIdArray
            };
            
            // separate checks needed for possibly undefined nested properties
            if (typeof eventJson["place"] != 'undefined') { 
                placeCheck = eventJson["place"]["name"];
                eventContainer.newEvent.place = placeCheck;
            }
            
            if (typeof eventJson["cover"] != 'undefined') {
                // coverCheck = eventJson["cover"]["id"];
                request("https://graph.facebook.com/" + eventJson["cover"]["id"] + "?fields=webp_images&access_token=" + Credentials.token, function(error, response, body){
                    if (!error && response.statusCode == 200) {
                        var coverObj = JSON.parse(body);
                        coverCheck = coverObj["webp_images"][0]["source"];
                        eventContainer.newEvent.cover = coverCheck;
                        
                        // callback needs to be nested in request statement for cover to process
                        finalizeEvent(eventContainer,function(finalizedEvent){
                            callback(finalizedEvent);
                        });
  
                    } else {
                         console.log("Unsuccessful Cover Photo Graph API call");
                         console.log("Error: " + error + "\n" + 
                            "Response: " + response + "\n" +
                            "Response Status Code: " + response.statusCode);
                    }
                });
            } else {
                finalizeEvent(eventContainer,function(finalizedEvent){
                    callback(finalizedEvent);
                });
            }
            
        } else {
            console.log("initializeEvent: Unsuccessful Graph API call");
            console.log("Error: " + error + "\n" + 
                        "Response: " + response + "\n" +
                        "Response Status Code: " + response.statusCode);
        }
    });
};

// @param eventContainer is a obj containing an Event obj and an array of post id's
// finalizeEvent adds post id's to the Event obj and returns a finalized Event object
function finalizeEvent(eventContainer,callback){
    // var postArray = [];

    async.each(eventContainer.postIdArray,function(id,callback){
        createPost(id,function(post){
            eventContainer.newEvent.posts.push(post);
            callback();
        });
    }, function(err){
        if (err)
            console.log(err);
        else 
            callback(eventContainer.newEvent);
    });    
};

function createPost(postId,callback){
    request("https://graph.facebook.com/" + postId + "?fields=from,message,link,attachments,created_time,updated_time&access_token=" + Credentials.token, function (error, response, body){
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
                
            var newPost = new Post({
                user            : user,
                fbId            : fbId,
                message         : message,
                link            : link,
                attachments     : attachments,
                created_time    : created_time,
                updated_time    : updated_time
            });
            
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

function tester(){
    
    var attachments = [];
    
    var newPost = new Post({
        user            : "somebody",
        fbId            : "102349023",
        message         : "Yo",
        link            : "http://asldfj.com",
        attachments     : attachments,
        created_time    : Date.now(),
        updated_time    : Date.now()
    });
    
    newPost.attachments.push("an item");
    
    console.log(newPost);
};

module.exports = {
    tester          : tester,
    finalizeTeam    : finalizeTeam,
    finalizeEvent   : finalizeEvent,
    initializeEvent : initializeEvent,
    createPost      : createPost,
    initializeTeam  : initializeTeam,
    deleteAllTeams  : deleteAllTeams,
    deleteTeam      : deleteTeam
};