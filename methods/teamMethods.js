var mongoose        = require("mongoose"),
    request         = require("request"),
    async           = require("async"),
    Event           = require("../models/event"),
    Team            = require("../models/team"),
    Credentials     = require("../credentials"),
    EventMethods    = require("../methods/eventMethods");

// Creates a Team object and adds to DB
// fbPageId : the fbPageId of the team to be initialized
function initializeTeam(fbPageId){
    // control flow for checking if team already exists in DB
    Team.findByFbId(fbPageId).exec(function(err,team){
        if(err)
            console.log(err);
        else {
            if(team.length != 0)
                console.log(fbPageId + " team already exist in database");
            else {
                request("https://graph.facebook.com/" + fbPageId + "?fields=name,id,cover,emails,link,bio,description,about,personal_info,general_info,awards,events&access_token=" + Credentials.token, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var infoJson = JSON.parse(body);
                        request("https://graph.facebook.com/" + fbPageId + "/photos?fields=images&access_token="+ Credentials.token, function (err, response, body){
                            if (!err && response.statusCode == 200) {
                                var profilePicJson = JSON.parse(body);
                                // KNOWN BUG: cover id could be undefined and prevent team initializatio
                                request("https://graph.facebook.com/" + infoJson["cover"]["id"] + "?fields=webp_images&access_token=" + Credentials.token, function(err, response, body){
                                    if (!err && response.statusCode == 200) {
                                        var coverPicJson = JSON.parse(body);
                                        
                                        var name                = infoJson["name"],
                                            fbId                = infoJson["id"],
                                            // KNOWN BUG: profile picture could be undefined and prevent initialization
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
                                        var fbEventsIdArray = [];
                                        
                                        infoJson["events"]["data"].forEach(function(event){
                                            fbEventsIdArray.push(event["id"]);
                                        });
                                        
                                        // An object containing newTeam and fbEventsIdArray
                                        var teamContainer = {
                                            newTeam         : newTeam,
                                            fbEventsIdArray    : fbEventsIdArray
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
            }
        }
    });
};

// NOTE: if console.log(newlyCreated), events will be empty because of asynchronicity
function finalizeTeam(teamContainer){
    Team.create(teamContainer.newTeam, function(err, newlyCreated){
        if(err){
            console.log("Error with creating Team object");
            console.log("Error:" + err);
        } else {
            finalizeTeamEvents(teamContainer);
            console.log(newlyCreated.name + " team object created successfully");
            console.log(newlyCreated);
        }
   });
}

function finalizeTeamEvents(teamContainer){
    async.each(teamContainer.fbEventsIdArray,function(id,callback){
        EventMethods.initializeEvent(id);
        callback()
    }, function(err){
        if(err){
            console.log(err);
        } else {
            console.log(teamContainer.newTeam.name + " event objects created successfully");
        }
    });  
};

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
function deleteTeam(fbPageId){
    Team.findOneAndRemove({fbId:fbPageId},function(err, teamObj){
        if(err){
            console.log(err);
        // if teamObj exists 
        } if(teamObj){
            // remove events belonging to team from database
            async.each(teamObj.events,function(event,callback){
                EventMethods.deleteEventfromDatabaseOnly(event,function(){
                    callback();
                })
            });
            console.log(fbPageId + " events removed successfully");
            console.log(fbPageId + " team removed successfully");
        } else {
            console.log(fbPageId + " TEAM DOES NOT EXIST");
        }
    });
};

module.exports = {
    initializeTeam  : initializeTeam,
    deleteAllTeams  : deleteAllTeams,
    deleteTeam      : deleteTeam
};