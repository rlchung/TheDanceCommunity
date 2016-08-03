var mongoose    = require('mongoose'),
    request     = require('request'),
    Event       = require('./models/event'),
    Team        = require('./models/team'),
    Post        = require('./models/post'),
    Credentials = require('./credentials'),
    natural     = require('natural'),
    async       = require('async'),
    classifier  = new natural.BayesClassifier();

// initializeEvent takes an eventID and returns an Event object
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
            
            // classifies the event
            natural.BayesClassifier.load('classifier.json',null,function(err,classifier){
                if(err){
                    console.log(err);
                } else {
                    newEvent.category = classifier.classify(newEvent.name);
                }
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

module.exports = {
    finalizeEvent   : finalizeEvent,
    initializeEvent : initializeEvent,
    createPost      : createPost,
};