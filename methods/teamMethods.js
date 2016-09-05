var mongoose        = require("mongoose"),
    request         = require("request"),
    async           = require("async"),
    Event           = require("../models/event"),
    Team            = require("../models/team"),
    Credentials     = require("../credentials"),
    EventMethods    = require("../methods/eventMethods"),
    Directories     = require("../directories");

// Creates a Team object and adds to DB
// fbTeamId : the fbTeamId of the team to be initialized
function initializeTeam(fbTeamId){
    // control flow for checking if team already exists in DB
    Team.findByFbId(fbTeamId).exec(function(err,team){
        if(err)
            console.log(err);
        else {
            if(team.length != 0)
                console.log(fbTeamId + " team already exist in database");
            else {
                request("https://graph.facebook.com/" + fbTeamId + "?fields=name,id,cover,emails,link,bio,description,about,personal_info,general_info,awards,events&access_token=" + Credentials.token, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var infoJson = JSON.parse(body);
                        request("https://graph.facebook.com/" + fbTeamId + "/photos?fields=images&access_token="+ Credentials.token, function (err, response, body){
                            if (!err && response.statusCode == 200) {
                                var profilePicJson = JSON.parse(body);
                                var name                = infoJson["name"],
                                    fbId                = infoJson["id"],
                                    email               = infoJson["emails"],
                                    fbLink              = infoJson["link"],
                                    location            = Directories.fbIdToLocationDirectory[infoJson["id"]],
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
                                    email               : email,
                                    fbLink              : fbLink,
                                    location            : location,
                                    bio                 : bio,
                                    longDescription     : longDescription,
                                    shortDescription    : shortDescription,
                                    personalInfo        : personalInfo,
                                    generalInfo         : generalInfo,
                                    awards              : awards,
                                    events              : events
                                };
                                
                                if (profilePicJson["data"].length != 0)
                                    newTeam.profilePic = profilePicJson["data"][0]["images"][0]["source"];
                                
                                // An array of event fbId's that will be used to initialize Events belonging to Team obj
                                var fbEventsIdArray = [];
                                
                                infoJson["events"]["data"].forEach(function(event){
                                    fbEventsIdArray.push(event["id"]);
                                });
                                
                                // An object containing newTeam and fbEventsIdArray
                                var teamContainer = {
                                    newTeam             : newTeam,
                                    fbEventsIdArray     : fbEventsIdArray
                                };
                                
                                // separate check for undefined cover
                                if (typeof infoJson["cover"] != 'undefined'){
                                    request("https://graph.facebook.com/" + infoJson["cover"]["id"] + "?fields=webp_images&access_token=" + Credentials.token, function(err, response, body){
                                        if (!err && response.statusCode == 200) {
                                            var coverPicJson = JSON.parse(body);
                                            teamContainer.newTeam.coverPic = coverPicJson["webp_images"][0]["source"];
                                            finalizeTeam(teamContainer);
                                            
                                        } else {
                                            console.log("initializeTeam: Unsuccessful Graph API call to photos");
                                            console.log( err + "\n" + 
                                                        "Response: " + response);
                                        }
                                    });
                                } else {
                                    finalizeTeam(teamContainer);
                                }
                                    
                            } else {
                                console.log("initializeTeam: Unsuccessful Graph API call to photos");
                                console.log(err + "\n" + 
                                            "Response: " + response);
                            }
                        });
                    } else {
                        console.log("initializeTeam: Unsuccessful Graph API call");
                        console.log(err + "\n" + 
                                    "Response: " + response);
                    }
                });        
            }
        }
    });
};

// finalizeTeam is a helper function for initializeTeam that creates and finalizes the Team object
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

// finalizeTeamEvents is a helper function for finalizeTeam that initializes all given Team events
function finalizeTeamEvents(teamContainer){
    async.each(teamContainer.fbEventsIdArray,function(id,callback){
        EventMethods.initializeEvent(id);
        callback();
    }, function(err){
        if(err){
            console.log(err);
        } else {
            console.log(teamContainer.newTeam.name + " event objects created successfully");
        }
    });  
}

function updateTeam(dbTeamId){
    Team.findById(dbTeamId).exec(function(err,team){
       if(err){
           console.log(err);
       } else {
           if(team.length == 0){
               console.log(dbTeamId + " team does not exist in the database");
           } else {
               request("https://graph.facebook.com/" + team.fbId + "?fields=name,cover,emails,link,bio,description,about,personal_info,general_info,awards&access_token=" + Credentials.token, function (err, response, body){
                    if (!err && response.statusCode == 200){
                        var currentTeamJson = JSON.parse(body);
                        request("https://graph.facebook.com/" + team.fbId + "/photos?fields=images&access_token="+ Credentials.token, function (err, response, body){
                            if(!err && response.statusCode ==200){
                                var currentProfilePicJson = JSON.parse(body);
                                var currentName             = currentTeamJson["name"],
                                    currentEmail            = currentTeamJson["emails"],
                                    currentFbLink           = currentTeamJson["link"],
                                    currentBio              = currentTeamJson["bio"],
                                    currentLongDescription  = currentTeamJson["description"],
                                    currentShortDescription = currentTeamJson["about"],
                                    currentPersonalInfo     = currentTeamJson["personal_info"],
                                    currentGeneralInfo      = currentTeamJson["general_info"],
                                    currentAwards           = currentTeamJson["awards"];
                                
                                var currentTeam = new Team({
                                    name                : currentName,
                                    email               : currentEmail,
                                    fbLink              : currentFbLink,
                                    bio                 : currentBio,
                                    longDescription     : currentLongDescription,
                                    shortDescription    : currentShortDescription,
                                    personalInfo        : currentPersonalInfo,
                                    generalInfo         : currentGeneralInfo,
                                    awards              : currentAwards,
                                })
                                
                                // separate check for undefined profile pic
                                if(currentProfilePicJson["data"].length != 0)
                                    currentTeam.profilePic = currentProfilePicJson["data"][0]["images"][0]["source"];
                                
                                // Update all events before updating team
                                updateTeamEvents(dbTeamId);
                                 
                                // separate check for undefined cover
                                if(typeof currentTeamJson["cover"] != 'undefined'){
                                    request("https://graph.facebook.com/" + currentTeamJson["cover"]["id"] + "?fields=webp_images&access_token=" + Credentials.token, function(err, response, body){
                                        if(!err && response.statusCode == 200){
                                            var currentCoverPicJson = JSON.parse(body);
                                            currentTeam.coverPic = currentCoverPicJson["webp_images"][0]["source"];
                                            
                                            // updating all necessary fields
                                            
                                            team.name               = currentTeam.name;
                                            team.profilePic         = currentTeam.profilePic;
                                            team.coverPic           = currentTeam.coverPic;
                                            team.email              = currentTeam.email;
                                            team.fbLink             = currentTeam.fbLink;
                                            team.bio                = currentTeam.bio;
                                            team.longDescription    = currentTeam.longDescription;
                                            team.shortDescription   = currentTeam.shortDescription;
                                            team.personalInfo       = currentTeam.personalInfo;
                                            team.generalInfo        = currentTeam.generalInfo;
                                            team.awards             = currentTeam.awards;
                                            team.save(function(){
                                                console.log(dbTeamId + " team updated");
                                            })
                                            
                                        } else {
                                            console.log("updateTeam: Unsuccessful Graph API call to photos");
                                            console.log(err + "\n" + 
                                                        "Response: " + response);
                                        }
                                    });
                                } else {
                                    console.log(currentTeam);
                                }
        
                                
                            } else {
                                console.log("updateTeam: Unsuccessful Graph API call to photos");
                                console.log(err + "\n" + 
                                            "Response: " + response);  
                            } 
                        });    
                    } else{
                        console.log("updateTeam: Unsuccessful Graph API call");
                        console.log(err + "\n" + 
                                    "Response: " + response);
                    }
               });
           }
       }
    });
}

// updateTeamEvents is a helper function for updateTeam that updates all events for given team
// events not in db are added, events in db are updated, and events no longer current are removed
function updateTeamEvents(dbTeamId){
    
    Team.findById(dbTeamId).exec(function(err,team){
        if(err){
            console.log(err);
        } else {
            if(team.length == 0)
                console.log(dbTeamId + " team does not exist in the database");
            else {
                request("https://graph.facebook.com/" + team.fbId + "?fields=events&access_token=" + Credentials.token, function (err, response, body){
                    if (!err && response.statusCode == 200) {
                        var currentTeamJson = JSON.parse(body);
                        
                        // handles event creation, update, deletion logic
                        // fbEventsIdArray contains the most updated event Id's
                        var fbEventsIdArray = [];
                                    
                        currentTeamJson["events"]["data"].forEach(function(event){
                            fbEventsIdArray.push(event["id"]);
                        });
                        
                        // for each event in fbEventsIdArray in team.events, update events in team.events
                        async.each(fbEventsIdArray,function(fbEventId,callback){
                            Event.findByFbId(fbEventId).exec(function(err,event){
                                if(err) {
                                    console.log(err)
                                // if event is not found in existing database, add to database
                                } else if (event.length === 0){
                                    EventMethods.initializeEvent(fbEventId);
                                // if event is found in existing database, update event
                                } else {
                                    EventMethods.updateEvent(event[0]._id);
                                }
                                callback();
                            });  
                        });
                        
                        // for events in team.events not in fbEventsIdArray, delete events in team.events
                        async.each(team.events,function(dbEventId,callback){
                            Event.findById(dbEventId).exec(function(err,event){
                                if(err){
                                    console.log(err);
                                } else {
                                    // if a event in the old team is not found in the database, remove it from old team events array
                                    if(event === null){
                                        team.events.splice(team.events.indexOf(dbEventId),1);
                                        team.save();
                                    }
                                    
                                    // if a event in the old team is not found in fbEventsIdArray, it is outdated and must be deleted
                                    else if(fbEventsIdArray.indexOf(event.fbId) === -1) {
                                        EventMethods.deleteEvent(event._id);
                                    }
                                }
                                callback();
                            });
                        });
                    } else {
                            console.log("updateTeamEvents: Unsuccessful Graph API call");
                            console.log(err + "\n" + 
                                        "Response: " + response);
                    }
                });
            }
        }
    });
}

// Deletes a given team from the database
function deleteTeam(fbTeamId){
    
    Team.findOneAndRemove({fbId:fbTeamId},function(err, teamObj){
        if(err){
            console.log(err);
        // if teamObj exists 
        } if(teamObj){
            // // remove events belonging to team from database
            async.each(teamObj.events,function(event,callback){
                EventMethods.deleteEventFromDatabaseOnly(event,function(){
                    callback();
                });
            });
            console.log(fbTeamId + " events removed successfully");
            console.log(fbTeamId + " team removed successfully");
        } else {
            console.log(fbTeamId + " TEAM DOES NOT EXIST");
            return;
        }
    });
};

module.exports = {
    initializeTeam      : initializeTeam,
    updateTeam          : updateTeam,
    updateTeamEvents    : updateTeamEvents,
    deleteTeam          : deleteTeam
};