var mongoose    = require("mongoose"),
    request     = require("request"),
    Post        = require("./models/post"),
    Credentials = require("./credentials");
    
// initializePost initializes a Post object the database
// @param postId is the fbId of the post we want to instantiate
function initializePost(postId,callback){
    // control flow for checking if post already exists in DB
    Post.findByFbId(postId).exec(function(err,post){
        if(err)
            console.log(err);
        else {
            if(post.length != 0)
                console.log("Post " + postId + " already exists in database");
            else {
                request("https://graph.facebook.com/" + postId + "?fields=from,message,link,attachments,created_time,updated_time&access_token=" + Credentials.token, function (err, response, body){
                    if(!err && response.statusCode == 200){
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
                        
                        Post.create(newPost, function(err, newlyCreated){
                            if(err){
                                console.log("Error with creating Post Object");
                                console.log("Error:" + err);
                            } else {
                                callback(newlyCreated);
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
};

// Deletes all events from database
function deleteAllPosts(){
    Post.remove({},function(err){
        if(err){
            console.log(err);
        } else {
            console.log("Removed all Post Objects from Database");
        }
    });
};

// Deletes a given Post object from the database
function deletePost(postId){
    Post.findOneAndRemove({fbId:postId},function(err, postObj){
        if(err){
            console.log(err);
        // if postObj exists 
        } if(postObj){
            console.log(postId + "post removed successfully");
        } else {
            console.log(postId + " POST DOES NOT EXIST");
        }
    });
};

module.exports = {
    initializePost  : initializePost,
    deleteAllPosts  : deleteAllPosts,
    deletePost      : deletePost
};
