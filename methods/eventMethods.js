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
function initializeEvent(fbEventId,callback){
    // control flow for checking if event already exists in DB
    Event.findByFbId(fbEventId).exec(function(err,event){
        if(err){
            console.log(err);
        } else {
            if(event.length != 0)
                console.log(fbEventId + "event already exists in database");
            else {
                request("https://graph.facebook.com/" + fbEventId + "?fields=name,cover,owner,description,place,start_time,end_time,attending_count,declined_count,interested_count,maybe_count,feed,photos{images},updated_time&access_token=" + Credentials.token, function (err, response, body){
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
                            
                            var fbPostIdArray = [];
                                            
                            eventJson["feed"]["data"].forEach(function(event){
                                fbPostIdArray.push(event["id"]);
                            });
                                            
                            // An object containing newEvent and fbPostIdArray
                            var eventContainer = {
                                newEvent    : newEvent,
                                fbPostIdArray : fbPostIdArray
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
    });
};

// finalizeEvent is a helper function that adds post id's to the Event obj and adds finalized event to DB
// @param eventContainer is a obj containing an Event obj and an array of post id's
function finalizeEvent(eventContainer,callback){

    async.each(eventContainer.fbPostIdArray,function(id,callback){
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
                                currentPosts           = [],
                                currentUpdatedTime     = new Date(currentEventJson["updated_time"]);
                            
                            // CURRENT WRONG FOR TESTING PURPOSES
                            if(currentUpdatedTime.getTime() != event.updatedTime.getTime()){
                                console.log(dbEventId + " event is up-to-date");
                            } else {
                                // main update logic goes here
                                
                                // classifies the updated event
                                natural.BayesClassifier.load('classifier.json',null,function(err,classifier){
                                if(err){
                                    console.log(err);
                                } else {
                                    currentCategory = classifier.classify(currentName);
                                }
                                
                                // adds photos to 'photos' array, if any
                                if (typeof currentEventJson["photos"] != 'undefined') {
                                    currentEventJson["photos"]["data"].forEach(function(object){
                                        currentPhotos.push(object["images"][0]["source"])
                                    });
                                }
                                
                                // handles post creation, update, deletion logic
                                // fbPostIdArray contains the most updated post Id's
                                var fbPostIdArray = [];
                                            
                                currentEventJson["feed"]["data"].forEach(function(event){
                                    fbPostIdArray.push(event["id"]);
                                });
                                
                                // for each post in fbPostIdArray in event.posts, update posts in event.posts and add dbPostId's to currentPosts
                                async.each(fbPostIdArray,function(fbPostId,callback){
                                    Post.findByFbId(fbPostId).exec(function(err,post){
                                        if(err) {
                                            console.log(err)
                                        // if post is not found in existing database, add to database
                                        } else if (post.length === 0){
                                            PostMethods.initializePost(fbPostId,function(newPost){
                                                console.log(newPost._id + " post added to " + dbEventId + " event");
                                            });
                                        // if post is found in existing database, update post
                                        } else {
                                            PostMethods.updatePost(post[0]._id);
                                            callback();
                                        }
                                    });  
                                });
                                
                                // for posts in event.posts not in fbPostIdArray, delete posts in event.posts
                                async.each(event.posts,function(dbPostId,callback){
                                    Post.findById(dbPostId).exec(function(err,post){
                                        if(err){
                                            console.log(err);
                                        } else {
                                            // if a post in the old event is not found in fbPostIdArray, it is outdated and must be deleted
                                            if(fbPostIdArray.indexOf(post.fbId) === -1) {
                                                PostMethods.deletePost(post._id);
                                                callback();
                                            }
                                            console.log(post);
                                        }
                                    });
                                });
                                
                                // add all _id's of posts to currentPosts
                                async.each(fbPostIdArray,function(fbPostId,callback){
                                    Post.findByFbId(fbPostId).exec(function(err,post){
                                        if(err){
                                            console.log(err);
                                        } else {
                                            currentPosts.push(post[0]._id);
                                        }
                                    }) 
                                });
                                
                                console.log(currentPosts);
                                
                                // separate checks needed for possibly undefined nested properties
                                if (typeof currentEventJson["place"] != 'undefined') { 
                                    currentPlaceCheck = currentEventJson["place"]["name"];
                                }
                                
                                // if (typeof currentEventJson["cover"] != 'undefined') {
                                // // coverCheck = eventJson["cover"]["id"];
                                // request("https://graph.facebook.com/" + currentEventJson["cover"]["id"] + "?fields=webp_images&access_token=" + Credentials.token, function(err, response, body){
                                //     if (!err && response.statusCode == 200) {
                                //         var coverObj = JSON.parse(body);
                                //         currentCoverCheck = coverObj["webp_images"][0]["source"];
                                        
                                //         // updating all necessary fields
                                        
                  
                                //     } else {
                                //          console.log("Unsuccessful Cover Photo Graph API call");
                                //          console.log("Error: " + err + "\n" + 
                                //             "Response: " + response + "\n" +
                                //             "Response Status Code: " + response.statusCode);
                                //     }
                                // });
                                // } else {
                                    
                                // }
                            
                                });
                            }
                            
                        } else {
                            console.log("Unsuccessful Cover Photo Graph API call");
                            console.log("Error: " + err + "\n" + 
                                        "Response: " + response + "\n" +
                                        "Response Status Code: " + response.statusCode);
                        }
                    });
            }
        }
    })
};

// addPostToEvent adds a given post to the given event's posts array and database
function addPostToEvent(dbEventId,fbPostId){
    Event.findById(dbEventId).exec(function(err,event){
       if(err){
           console.log(err);
       } else {
           if(event.length == 0){
               console.log(dbEventId + " event does not exist in the database");
           } else {
               PostMethods.initializePost(fbPostId,function(post){
                   event.posts.push(post._id);
                   event.save(function(){
                        console.log(fbPostId + " post added to " + dbEventId + " event");    
                   });
               });
           }
       }
    });
}

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

// deleteEventfromDatabaseOnly removes an event from the database only
function deleteEventfromDatabaseOnly(dbEventId){
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
};

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
};

module.exports = {
    finalizeEvent               : finalizeEvent,
    initializeEvent             : initializeEvent,
    updateEvent                 : updateEvent,
    addPostToEvent              : addPostToEvent,
    deleteAllEvents             : deleteAllEvents,
    deleteEvent                 : deleteEvent,
    deleteEventfromDatabaseOnly : deleteEventfromDatabaseOnly
};