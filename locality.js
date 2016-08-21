var geolib = require("geolib");

var cities = {
    "los-angeles"       : {latitude : 34.0522342, longitude: -118.2436849},
    // Orange County
    "anaheim"           : {latitude: 33.8352932, longitude: -117.9145036},
    "irvine"            : {latitude: 33.6839473, longitude: -117.7946942},
    "santa-ana"         : {latitude: 33.7455731, longitude: -117.8678338},
    "cerritos"          : {latitude: 33.8583483, longitude: -118.0647871},
    "monterey-park"     : {latitude: 34.0625106, longitude: -118.1228476},
    "walnut"            : {latitude: 34.0202894, longitude: -117.8653386},
    "long-beach"        : {latitude: 33.7700504, longitude: -118.1937395}
    // "rancho-cucamonga"  : {latitude: ,longitude:},
    // "west-covina"       : {latitude: ,longitude:},
    // "riverside"         : {latitude: ,longitude:},
    // "berkeley"          : {latitude: ,longitude:},
    // "suisin-city"       : {latitude: ,longitude:},
    // "daly-city"         : {latitude: ,longitude:},
    // "san-diego"         : {latitude: ,longitude:}
}

function getCommunity(address, callback){
    var test = "los-angeles";
    callback(test);
};

module.exports = {
    getCommunity    : getCommunity
};