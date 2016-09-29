var geolib              = require("geolib"),
    googleMapsClient    = require('@google/maps').createClient({
        key: 'AIzaSyC2h-DBCBSUmKcgfpr2PPX_9vZTugX_iuU'
    }),
    _                   = require('lodash'),
    Directories         = require('./directories');

// geocodeAddress geocodes a given input address into coordinates
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

// nearestCommunity takes in a coordinate and returns a callback with the key/name of the closest community
function nearestCommunity(coordinates,callback){
    //a coordinate object representing the closest community in our "cities" object
    var community = geolib.findNearest(coordinates,Directories.cityCoordinatesDirectory,0);
    callback(community.key);
};

// nearbyCommunities takes in a coordinate and returns a callback with the key/names of 3 nearby communities
function nearbyCommunities(coordinates, callback){
    var formattedNearbyCity0 = geolib.findNearest(coordinates,Directories.formattedCityCoordinatesDirectory,0);
    var formattedNearbyCity1 = geolib.findNearest(coordinates,Directories.formattedCityCoordinatesDirectory,1);
    var formattedNearbyCity2 = geolib.findNearest(coordinates,Directories.formattedCityCoordinatesDirectory,2);
    
    var results = {
        formattedNearbyCity0 : formattedNearbyCity0.key,
        formattedNearbyCity1 : formattedNearbyCity1.key,
        formattedNearbyCity2 : formattedNearbyCity2.key
    }
    
    callback(results);
}

module.exports = {
    geocodeAddress      : geocodeAddress,
    nearestCommunity    : nearestCommunity,
    nearbyCommunities   : nearbyCommunities
};