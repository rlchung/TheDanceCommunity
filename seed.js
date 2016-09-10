var mongoose    = require("mongoose"),
    TeamMethods = require("./methods/teamMethods"),
    Directories = require("./directories");
    
function seedDB(){
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.aca);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.chaotic3);
    // TeamMethods.initializeTeam(Directories.teamFbIdDirectory.hallOfFame);
    // TeamMethods.initializeTeam(Directories.teamFbIdDirectory.makerEmpire);
    // TeamMethods.initializeTeam(Directories.teamFbIdDirectory.theMob);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.nsuModern);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.samahangModern);
    // TeamMethods.initializeTeam(Directories.teamFbIdDirectory.vsuModern);
    
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.pacModern);
    
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.barkadaModern);
}

module.exports = seedDB;