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

function geocodeAddress(address, callback){
    // searches and geocodes closest matching address in Southern California
    googleMapsClient.geocode({
        address: address,
        bounds: { south: 32.528832, west: -121.438176, north: 35.809236, east: -114.131211},
        components: {
            country: 'United States'
        }
    }, function(err,response){
        if(!err)
            callback(response.json.results[0].geometry.location);
        else
            console.log(err);
    });
};

// nearestCommunity will take in any coordinate object and will return a callback with the key/name of the closest community
function nearestCommunity(coordinates,callback){
    //a coordinate object representing the closest community in our "cities" object
    var nearest = geolib.findNearest(coordinates,cities,0);
    callback(nearest.key);
};



module.exports = {
    geocodeAddress      : geocodeAddress,
    nearestCommunity    : nearestCommunity
};