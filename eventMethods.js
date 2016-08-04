var mongoose    = require('mongoose'),
    request     = require('request'),
    Event       = require('./models/event'),
    Team        = require('./models/team'),
    Post        = require('./models/post'),
    PostMethods = require('./postMethods'),
    Credentials = require('./credentials'),
    natural     = require('natural'),
    async       = require('async'),
    classifier  = new natural.BayesClassifier();

// initializeEvent initializes all values of a given event and adds the event to the DB through helper function finalizeEvent
function initializeEvent(eventId,callback){
    // control flow for checking if event already exists in DB
    Event.findByFbId(eventId).exec(function(err,event){
        if(err)
            console.log(err);
        else {
            if(event.length != 0)
                console.log(eventId + "event already exists in database");
            else {
                request("https://graph.facebook.com/" + eventId + "?fields=name,cover,owner,description,place,start_time,end_time,attending_count,declined_count,interested_count,maybe_count,feed,photos{images},updated_time&access_token=" + Credentials.token, function (err, response, body){
                        if (!err && response.statusCode == 200) {
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
                                request("https://graph.facebook.com/" + eventJson["cover"]["id"] + "?fields=webp_images&access_token=" + Credentials.token, function(err, response, body){
                                    if (!err && response.statusCode == 200) {
                                        var coverObj = JSON.parse(body);
                                        coverCheck = coverObj["webp_images"][0]["source"];
                                        eventContainer.newEvent.cover = coverCheck;
                                        
                                        // callback needs to be nested in request statement for cover to process
                                        finalizeEvent(eventContainer,function(finalizedEvent){
                                            callback(finalizedEvent);
                                        });
                  
                                    } else {
                                         console.log("Unsuccessful Cover Photo Graph API call");
                                         console.log("Error: " + err + "\n" + 
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
                            console.log("Error: " + err + "\n" + 
                                        "Response: " + response + "\n" +
                                        "Response Status Code: " + response.statusCode);
                        }
                    });
            }
        }
    })
};

// finalizeEvent is a helper function that adds post id's to the Event obj and adds finalized event to DB
// @param eventContainer is a obj containing an Event obj and an array of post id's
function finalizeEvent(eventContainer,callback){

    async.each(eventContainer.postIdArray,function(id,callback){
        PostMethods.initializePost(id,function(post){
            eventContainer.newEvent.posts.push(post._id);
            callback();
        });
    }, function(err){
        if (err)
            console.log(err);
        else {
            Event.create(eventContainer.newEvent, function(err, newlyCreated){
                if(err){
                    console.log("Error with creating Event object");
                    console.log("Error:" + err);
                } else {
                    console.log(eventContainer.newEvent.name + " event object created successfully");
                    callback(newlyCreated);
                }
            })
        };
    });    
};

// Deletes all events from database
function deleteAllEvents(){
    Event.remove({},function(err){
        if(err){
            console.log(err);
        } else {
            console.log("Removed all Event Objects from Database");
        }
    });
};

// Deletes a given event from the database
// @param eventId is _id of the given event
function deleteEvent(eventId){
    Event.findByIdAndRemove(eventId,function(err, eventObj){
        if(err){
            console.log(err);
        // if eventObj exists 
        } if(eventObj){
            // remove posts belonging to event from database
            async.each(eventObj.posts,function(post,callback){
                Post.findByIdAndRemove(post,function(){
                    callback();     
                });
            });
         
            console.log(eventId + " posts removed successfully");
            console.log(eventId + " event removed successfully");
        } else {
            console.log(eventId + " EVENT DOES NOT EXIST");
        }
    });
};

module.exports = {
    finalizeEvent   : finalizeEvent,
    initializeEvent : initializeEvent,
    deleteAllEvents : deleteAllEvents,
    deleteEvent     : deleteEvent
};