var mongoose    = require("mongoose"),
    TeamMethods = require("./methods/teamMethods"),
    Directories = require("./directories");
    
function seedDB(){
    // los angeles
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.aca);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.chaotic3);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.hallOfFame);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.makerEmpire);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.theMob);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.nsuModern);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.samahangModern);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.vsuModern);
    
    // monterey park
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.kinjaz);
    
    // walnut
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.grv);
    
    //anaheim
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.teamMillenia);
    
    // irvine
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.goodProject);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.commonGround);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.kabaModern);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.cadc);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.mcia);
    
    // santa ana
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.corpsDanceCrew);
    
    // long beach
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.pacModern);
    
    // west covina
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.barkadaModern);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.theEcsntrcs);
    
    // riverside
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.nineZeroNineHhdt);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.collectiveFaction);
    
    // berkeley
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.mainStacks);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.afx);
    
    // suisin city
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.chapkisDanceFam);
    
    // daly city
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.theCompany);
    
    // san diego
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.twoTwenty);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.ascension);
    TeamMethods.initializeTeam(Directories.teamFbIdDirectory.choreoCookies);
}

module.exports = seedDB;