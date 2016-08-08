var mongoose    = require("mongoose"),
    request     = require("request"),
    Post        = require("../models/post"),
    Event       = require("../models/event"),
    Credentials = require("../credentials");
    
// initializePost initializes a Post object the database
// @param fbPostId is the fbId of the post we want to instantiate
function initializePost(fbPostId){
    // control flow for checking if post already exists in DB
    Post.findByFbId(fbPostId).exec(function(err,post){
        if(err)
            console.log(err);
        else {
            if(post.length != 0)
                console.log(fbPostId + " post already exists in database");
            else {
                request("https://graph.facebook.com/" + fbPostId + "?fields=from,target,message,link,attachments,created_time,updated_time&access_token=" + Credentials.token, function (err, response, body){
                    if(!err && response.statusCode == 200){
                        var postJson = JSON.parse(body);
                        
                        // additional undefined checks needed 
                        var attachments = [];    
                        
                        var user            = postJson["from"]["name"],
                            fbId            = postJson["id"],
                            fbEventId       = postJson["target"]["id"],
                            message         = postJson["message"],
                            link            = postJson["link"],
                            createdTime     = postJson["created_time"],
                            updatedTime     = postJson["updated_time"];
                            
                        var newPost = new Post({
                            user            : user,
                            fbId            : fbId,
                            fbEventId       : fbEventId,
                            message         : message,
                            link            : link,
                            attachments     : attachments,
                            createdTime     : createdTime,
                            updatedTime     : updatedTime
                        });
                        
                        // separate checks needed for possibly undefined nested properties
                        // KNOWN BUG: Sub-attachments (Multiple attachments for one post) not accounted for yet
                        if (typeof postJson["attachments"] != 'undefined') { 
                            postJson["attachments"]["data"].forEach(function(object){
                                for (var content in object["media"]){
                                    newPost.attachments.push(object["media"][content]["src"]);
                                }
                            });
                        }
                        
                        Post.create(newPost, function(err, newlyCreated){
                            if(err){
                                console.log("Error with creating Post Object");
                                console.log("Error:" + err);
                            } else {
                                // add the post to the parent event's posts array in database
                                Event.findByFbId(newlyCreated.fbEventId).exec(function(err,event){
                                    if(err){
                                        console.log(err);
                                    } else {
                                        if(event.length === 0){
                                            console.log(newlyCreated.fbEventId + "does not exist in database");
                                        } else {
                                            event[0].posts.push(newlyCreated._id);
                                            event[0].save();
                                        }
                                    }
                                });
                            }
                        });
                        
                    } else {
                        console.log("initializePost: Unsuccessful Graph API call");
                        console.log("Error: " + err + "\n" + 
                                    "Response: " + response + "\n" +
                                    "Response Status Code: " + response.statusCode);
                    } 
                });
            }
        }
    })
}

// updatePost updates a given Post object
// @param dbPostId is the _id of the given post
function updatePost(dbPostId){
    // Check if post exists in DB
    Post.findById(dbPostId).exec(function(err,post){
        if(err)
            console.log(err)
        else {
            if(post.length == 0)
                console.log(dbPostId + " post does not exist in database");
            else {
                //Main function logic goes in here
                request("https://graph.facebook.com/" + post.fbId + "?fields=message,attachments,updated_time&access_token=" + Credentials.token, function (err, response, body){
                    if(!err && response.statusCode == 200){
                        var currentPostJson = JSON.parse(body);
                        
                        // additional undefined checks needed 
                        var currentAttachments  = [],
                            currentMessage      = currentPostJson["message"],
                            currentUpdatedTime  = new Date(currentPostJson["updated_time"]);
                         
                        // if updatedTime is the same, don't update   
                        if(currentUpdatedTime.getTime() === post.updatedTime.getTime()) {
                            console.log(dbPostId + " post is up-to-date" );
                        }
                        else {
                        // separate checks needed for possibly undefined nested properties
                        // KNOWN BUG: Sub-attachments (Multiple attachments for one post) not accounted for yet
                            if (typeof currentPostJson["attachments"] != 'undefined') { 
                                currentPostJson["attachments"]["data"].forEach(function(object){
                                    for (var content in object["media"]){
                                        currentAttachments.push(object["media"][content]["src"]);
                                    }
                                });
                            }
                            
                            post.message        = currentMessage;
                            post.updatedTime    = currentUpdatedTime;
                            post.attachments    = currentAttachments;
                            
                            post.save(function(){
                                console.log(dbPostId + " post updated");
                            })
                        }
                        
                    } else {
                        console.log("updatePost: Unsuccessful Graph API call");
                        console.log("Error: " + err + "\n" +
                                    "Response: " + response + "\n" +
                                    "Response Status Code: " + response.statusCode);
                    }
                });        
            }
        }
    });
}

// Deletes all events from database
function deleteAllPosts(){
    Post.remove({},function(err){
        if(err){
            console.log(err);
        } else {
            console.log("Removed all Post Objects from Database");
        }
    });
}

// Deletes a given Post object from the database and from parent Event
function deletePost(dbPostId){
    // deletes post from parent event container
    Post.findById(dbPostId).exec(function(err,post){
        if(err){
            console.log(err);
        } else {
            Event.findByFbId(post.fbEventId).exec(function(err,event){
                if(err) {
                    console.log(err);
                } else {
                    var index = event[0].posts.indexOf(dbPostId);
                    event[0].posts.splice(index, 1);
                    event[0].save();
                }
            });
        }
    });
    // deletes the post object from the database
    Post.findByIdAndRemove(dbPostId,function(err, postObj){
        if(err){
            console.log(err);
        // if postObj exists 
        } if(postObj){
            
            console.log(dbPostId + " post removed successfully");
        } else {
            console.log(dbPostId + " POST DOES NOT EXIST");
        }
    });
}

module.exports = {
    initializePost  : initializePost,
    updatePost      : updatePost,
    deleteAllPosts  : deleteAllPosts,
    deletePost      : deletePost
};
