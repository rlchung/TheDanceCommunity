var geolib              = require("geolib"),
    googleMapsClient    = require('@google/maps').createClient({
        key: 'AIzaSyC2h-DBCBSUmKcgfpr2PPX_9vZTugX_iuU'
    }),
    _                   = require('lodash');

var cities = {
    "los-angeles"       : {lat : 34.0522342, lng: -118.2436849},
    // Orange County
    "anaheim"           : {lat: 33.8352932, lng: -117.9145036},
    "irvine"            : {lat: 33.6839473, lng: -117.7946942},
    "santa-ana"         : {lat: 33.7455731, lng: -117.8678338},
    "cerritos"          : {lat: 33.8583483, lng: -118.0647871},
    "monterey-park"     : {lat: 34.0625106, lng: -118.1228476},
    "walnut"            : {lat: 34.0202894, lng: -117.8653386},
    "long-beach"        : {lat: 33.7700504, lng: -118.1937395}
    // "rancho-cucamonga"  : {lat: ,lng:},
    // "west-covina"       : {lat: ,lng:},
    // "riverside"         : {lat: ,lng:},
    // "berkeley"          : {lat: ,lng:},
    // "suisin-city"       : {lat: ,lng:},
    // "daly-city"         : {lat: ,lng:},
    // "san-diego"         : {lat: ,lng:}
}

function getCommunity(address, callback){
    // searches and geocodes closest matching address
    googleMapsClient.geocode({
        address: address
    }, function(err,response){
        if(!err)
            console.log(response.json.results[0].geometry.location);
    })
    callback(address);
};

module.exports = {
    getCommunity    : getCommunity
};