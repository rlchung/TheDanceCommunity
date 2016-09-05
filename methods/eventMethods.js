var mongoose    = require('mongoose'),
    request     = require('request'),
    Event       = require('../models/event'),
    Team        = require('../models/team'),
    Post        = require('../models/post'),
    PostMethods = require('../methods/postMethods'),
    Credentials = require('../credentials'),
    natural     = require('natural'),
    async       = require('async'),
    classifier  = new natural.BayesClassifier();

// initializeEvent initializes all values of a given event and adds the event to the DB through helper function finalizeEvent
function initializeEvent(fbEventId){
    // control flow for checking if event already exists in DB
    Event.findByFbId(fbEventId).exec(function(err,event){
        if(err){
            console.log(err);
        } else {
            if(event.length != 0)
                console.log(fbEventId + " event already exists in database");
            else {
                request("https://graph.facebook.com/" + fbEventId + "?fields=name,cover,owner,description,place,start_time,end_time,attending_count,declined_count,interested_count,maybe_count,feed,photos{images},updated_time&access_token=" + Credentials.token, function (err, response, body){
                    if (!err && response.statusCode == 200) {
                        var eventJson = JSON.parse(body);
                        
                        // If event is older than 2 weeks, don't initialize
                        var endDate = new Date(eventJson["end_time"]);
                        
                        if((Date.now() - endDate.getTime()) <= 1209600000){
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
                                fbId            : fbEventId,
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
                            
                            var fbPostsIdArray = [];
                                            
                            eventJson["feed"]["data"].forEach(function(event){
                                fbPostsIdArray.push(event["id"]);
                            });
                                            
                            // An object containing newEvent and fbPostsIdArray
                            var eventContainer = {
                                newEvent    : newEvent,
                                fbPostsIdArray : fbPostsIdArray
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
                                        finalizeEvent(eventContainer);
                  
                                    } else {
                                         console.log("Unsuccessful Cover Photo Graph API call");
                                         console.log(err + "\n" + 
                                            "Response: " + response + "\n");
                                    }
                                });
                            } else {
                                finalizeEvent(eventContainer);
                            }
                        } else {
                            // return if event is older than 2 weeks
                            return;
                        }
                    } else {
                        console.log("initializeEvent: Unsuccessful Graph API call when initializing " + fbEventId);
                        console.log(err + "\n" + 
                                    "Response: " + response);
                    }
                });
            }
        }
    });
}

// finalizeEvent is a helper function for initializeEvent that adds the event to the database
// @param eventContainer is a obj containing an Event obj and an array of post id's
function finalizeEvent(eventContainer){

    Event.create(eventContainer.newEvent, function(err, newlyCreated){
        if(err){
            console.log("Error with creating Event object");
            console.log("Error:" + err);
        } else {
            finalizeEventPosts(eventContainer);
            Team.findByFbId(newlyCreated.hostId).exec(function(err,team){
                if(err){
                    console.log(err);
                } else {
                    if(team.length === 0){
                        console.log(newlyCreated.hostId + " does not exist in database");
                    } else {
                        team[0].events.push(newlyCreated._id);
                        team[0].save();
                        console.log(newlyCreated._id + " event added to " + newlyCreated.hostId + " team" );
                    }
                }
            });
        }
    });   
}

// finalizeEventPosts is a helper function for finalizeEvent that initializes all posts for initializeEvent
function finalizeEventPosts(eventContainer){
    async.each(eventContainer.fbPostsIdArray,function(id,callback){
        PostMethods.initializePost(id);
        callback();
    }, function(err){
        if(err){
            console.log(err);
        } else {
            console.log(eventContainer.newEvent.name + " post objects created successfully");
        }
    });  
}

// updateEvent updates all updateable fields for a given Event object
// @param dbEventId is the _id of the given Event
function updateEvent(dbEventId){
    Event.findById(dbEventId).exec(function(err,event){
        if(err){
            console.log(err);
        } else {
            if(event.length == 0)
                console.log(dbEventId + " event does not exist in the database");
            else {
                request("https://graph.facebook.com/" + event.fbId + "?fields=name,cover,description,place,start_time,end_time,attending_count,declined_count,interested_count,maybe_count,feed,photos{images},updated_time&access_token=" + Credentials.token, function (err, response, body){
                    if (!err && response.statusCode == 200) {
                        var currentEventJson = JSON.parse(body);
                        
                        // If event is older than 2 weeks, don't initialize
                        var endDate = new Date(currentEventJson["end_time"]);
                        
                        if((Date.now() - endDate.getTime()) <= 1209600000){
                            
                            // additional undefined tests needed
                            var currentPlaceCheck;
                            var currentCoverCheck;
                            
                            // current category of updated event
                            var currentCategory;
                            
                            // newEvent variables
                            var currentName            = currentEventJson["name"],
                                currentDescription     = currentEventJson["description"],
                                currentStartTime       = currentEventJson["start_time"],
                                currentEndTime         = currentEventJson["end_time"],
                                currentAttendingCount  = currentEventJson["attending_count"],
                                currentDeclinedCount   = currentEventJson["declined_count"],
                                currentInterestedCount = currentEventJson["interested_count"],
                                currentMaybeCount      = currentEventJson["maybe_count"],
                                currentPhotos          = [],
                                currentUpdatedTime     = new Date(currentEventJson["updated_time"]);
                            
                            var updatedEvent = new Event({
                                name            : currentName,
                                description     : currentDescription,
                                startTime       : currentStartTime,
                                endTime         : currentEndTime,
                                attendingCount  : currentAttendingCount,
                                declinedCount   : currentDeclinedCount,
                                interestedCount : currentInterestedCount,
                                maybeCount      : currentMaybeCount,
                                photos          : currentPhotos,
                                updatedTime     : currentUpdatedTime,
                                place           : currentPlaceCheck,
                                cover           : currentCoverCheck,
                                category        : currentCategory
                            });
                            
                            // Update all posts before updating event
                            updateEventPosts(dbEventId);
                            
                            if(currentUpdatedTime.getTime() === event.updatedTime.getTime()){
                                // console.log(dbEventId + " event is up-to-date");
                            } else {
                                // main update logic goes here
                                
                                // classifies the updated event
                                natural.BayesClassifier.load('classifier.json',null,function(err,classifier){
                                    if(err){
                                        console.log(err);
                                    } else {
                                        updatedEvent.category = classifier.classify(currentName);
                                    }
                                });
                                
                                // adds photos to 'photos' array, if any
                                if (typeof currentEventJson["photos"] != 'undefined') {
                                    currentEventJson["photos"]["data"].forEach(function(object){
                                        updatedEvent.photos.push(object["images"][0]["source"])
                                    });
                                }
                                
                                // separate checks needed for possibly undefined nested properties
                                if (typeof currentEventJson["place"] != 'undefined') { 
                                    updatedEvent.place = currentEventJson["place"]["name"];
                                }
                                
                                if (typeof currentEventJson["cover"] != 'undefined') {
                                    request("https://graph.facebook.com/" + currentEventJson["cover"]["id"] + "?fields=webp_images&access_token=" + Credentials.token, function(err, response, body){
                                        if (!err && response.statusCode == 200) {
                                            var coverObj = JSON.parse(body);
                                            updatedEvent.cover = coverObj["webp_images"][0]["source"];
                                            
                                            // updating all necessary fields
                                            
                                            event.name              = updatedEvent.name;
                                            event.description       = updatedEvent.description;
                                            event.startTime         = updatedEvent.startTime;
                                            event.endTime           = updatedEvent.endTime;
                                            event.attendingCount    = updatedEvent.attendingCount;
                                            event.declinedCount     = updatedEvent.declinedCount;
                                            event.interestedCount   = updatedEvent.interestedCount;
                                            event.maybeCount        = updatedEvent.maybeCount;
                                            event.photos            = updatedEvent.photos;
                                            event.updatedTime       = updatedEvent.updatedTime;
                                            event.place             = updatedEvent.place;
                                            event.cover             = updatedEvent.cover;
                                            event.category          = updatedEvent.category;
                                            // event.save(function(){
                                            //     console.log(dbEventId + " event updated");
                                            // });
                                            event.save();
                      
                                        } else {
                                             console.log("Unsuccessful Cover Photo Graph API call");
                                             console.log("Error: " + err + "\n" + 
                                                         "Response: " + response);
                                        }
                                    });
                                } else {
                                    // updating all necessary fields
                                    
                                    event.name              = updatedEvent.name;
                                    event.description       = updatedEvent.description;
                                    event.startTime         = updatedEvent.startTime;
                                    event.endTime           = updatedEvent.endTime;
                                    event.attendingCount    = updatedEvent.attendingCount;
                                    event.declinedCount     = updatedEvent.declinedCount;
                                    event.interestedCount   = updatedEvent.interestedCount;
                                    event.maybeCount        = updatedEvent.maybeCount;
                                    event.photos            = updatedEvent.photos;
                                    event.updatedTime       = updatedEvent.updatedTime;
                                    event.place             = updatedEvent.place;
                                    event.cover             = updatedEvent.cover;
                                    event.category          = updatedEvent.category;
                                    // event.save(function(){
                                    //     console.log(dbEventId + " event updated");
                                    // });
                                    event.save();
                                }
                            }
                        } else {
                            // return if event is older than 2 weeks
                            return;
                        }
                    } else {
                        console.log("Unsuccessful Cover Photo Graph API call");
                        console.log(err + "\n" + 
                                    "Response: " + response);
                    }
                });
            }
        }
    })
}

// updateEventPosts is a helper function for updateEvent that updates all posts for the given event
// posts not in db are added, posts in db are updated, and posts no longer current are removed
function updateEventPosts(dbEventId){
    Event.findById(dbEventId).exec(function(err,event){
        if(err){
            console.log(err);
        } else {
            if(event.length == 0)
                console.log(dbEventId + " event does not exist in the database");
            else {
                request("https://graph.facebook.com/" + event.fbId + "?fields=feed&access_token=" + Credentials.token, function (err, response, body){
                    if (!err && response.statusCode == 200) {
                        var currentEventJson = JSON.parse(body);
                        
                        // handles post creation, update, deletion logic
                        // fbPostsIdArray contains the most updated post Id's
                        var fbPostsIdArray = [];
                                    
                        currentEventJson["feed"]["data"].forEach(function(event){
                            fbPostsIdArray.push(event["id"]);
                        });
                        
                        // for each post in fbPostsIdArray in event.posts, update posts in event.posts
                        async.each(fbPostsIdArray,function(fbPostId,callback){
                            Post.findByFbId(fbPostId).exec(function(err,post){
                                if(err) {
                                    console.log(err);
                                // if post is not found in existing database, add to database
                                } else if (post.length === 0){
                                    PostMethods.initializePost(fbPostId);
                                    console.log(fbPostId + " post added to " + dbEventId + " event");
                                // if post is found in existing database, update post
                                } else {
                                    PostMethods.updatePost(post[0]._id);
                                }
                                callback();
                            });  
                        });
                        
                        // for posts in event.posts not in fbPostsIdArray, delete posts in event.posts
                        async.each(event.posts,function(dbPostId,callback){
                            Post.findById(dbPostId).exec(function(err,post){
                                if(err){
                                    console.log(err);
                                } else {
                                    // if a post in the old event is not found in the database, remove it from old events posts array
                                    if(post === null){
                                        event.posts.splice(event.posts.indexOf(dbPostId),1);
                                        event.save();
                                    }
                                    
                                    // if a post in the old event is not found in fbPostsIdArray, it is outdated and must be deleted
                                    else if(fbPostsIdArray.indexOf(post.fbId) === -1) {
                                        PostMethods.deletePost(post._id);
                                    }
                                }
                                callback();
                            });
                        });
                    } else {
                            console.log("Unsuccessful Event Feed Graph API call");
                            console.log(err + "\n" + 
                                        "Response: " + response);
                    }
                });
            }
        }
    });
}

// deleteEventFromDatabaseOnly removes an event and associated posts from the database only
function deleteEventFromDatabaseOnly(dbEventId){
    Event.findByIdAndRemove(dbEventId,function(err, eventObj){
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
         
            console.log(dbEventId + " posts removed successfully");
            console.log(dbEventId + " event removed successfully");
        } else {
            console.log(dbEventId + " EVENT DOES NOT EXIST");
        }
    });
}

// Deletes a given event from the database and from parent Team
// @param dbEventId is _id of the given event
function deleteEvent(dbEventId){
    // delete event from parent Team container
    Event.findById(dbEventId).exec(function(err,event){
        if(err){
            console.log(err);
        } else {
            Team.findByFbId(event.hostId).exec(function(err,team){
                if(err) {
                    console.log(err);
                } else {
                    var index = team[0].events.indexOf(dbEventId);
                    team[0].events.splice(index, 1);
                    team[0].save();
                }
            });
        }
    });
    
    Event.findByIdAndRemove(dbEventId,function(err, eventObj){
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
         
            console.log(dbEventId + " posts removed successfully");
            console.log(dbEventId + " event removed successfully");
        } else {
            console.log(dbEventId + " EVENT DOES NOT EXIST");
        }
    });
}

module.exports = {
    finalizeEvent               : finalizeEvent,
    initializeEvent             : initializeEvent,
    updateEvent                 : updateEvent,
    deleteEvent                 : deleteEvent,
    deleteEventFromDatabaseOnly : deleteEventFromDatabaseOnly
};