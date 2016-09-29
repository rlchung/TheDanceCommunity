// Contains key-value pairs of given teams and their page_id
var teamFbIdDirectory = {
    // Los angeles
    'aca'               : 75035611936,
    'chaotic3'          : 124327507658376,
    'foundations'       : 277137469077279,
    'hallOfFame'        : 349717898382614,
    'makerEmpire'       : 180722678616577,
    'theMob'            : 435120296549776,
    'nsuModern'         : 1420546741605580,
    'samahangModern'    : 545398148962340,
    'vsuModern'         : 578630488962319,
    
    // Monterey Park
    'kinjaz'            : 163407667011343,
    
    // Walnut
    'grv'               : 141226349256771,
    
    // Anaheim
    'teamMillenia'      : 1402488130022276,
    
    // Irvine
    'goodProject'       : 806288446138820,
    'commonGround'      : 715545471897960,
    'kabaModern'        : 1476384099240314,
    'cadc'              : 55567386213,
    'mcia'              : 248079691961571,
    
    // Santa Ana
    'corpsDanceCrew'    : 1636432953249146,
    
    // Long beach
    'pacModern'         : 1556441934637177,
    
    // West covina
    'barkadaModern'     : 362999867221656,
    'theEcsntrcs'       : 374511862639598,
    
    // Riverside
    'nineZeroNineHhdt'  : 122336807845570,
    'collectiveFaction' : 494959817196351,
    
    // Berkeley
    'mainStacks'        : 251802261644121,
    'afx'               : 172807799490538,
    
    // Suisin City
    'chapkisDanceFam'   : 823512264388397,
    
    // Daly City
    'theCompany'        : 455666954534809,
    
    // San Diego
    'twoTwenty'         : 77873205278,
    'ascension'         : 126866124083830,
    'choreoCookies'     : 578945558851309
};

var competitionFbIdDirectory = {
    'bodyRock'          : 199437836735186,
    'bridge'            : 361879750609377,
    'fusion'            : 184822451538010,
    'maxtOut'           : 237658223056509,
    'preludeNorcal'     : 537913236272817,
    'ultimateBrawl'     : 381738788513134,
    'vibe'              : 122754417784582
};

// Contains key-value pairs of available cities and their coordinates
var cityCoordinatesDirectory = {
    'los-angeles'       : {lat : 34.0522342, lng: -118.2436849},
    // Orange County
    'anaheim'           : {lat: 33.8352932, lng: -117.9145036},
    'irvine'            : {lat: 33.6839473, lng: -117.7946942},
    'santa-ana'         : {lat: 33.7455731, lng: -117.8678338},
    'walnut'            : {lat: 34.0202894, lng: -117.8653386},
    'long-beach'        : {lat: 33.7700504, lng: -118.1937395},
    'west-covina'       : {lat: 34.0686208, lng: -117.9389526},
    'riverside'         : {lat: 33.9533487, lng: -117.3961564},
    'berkeley'          : {lat: 37.8715926, lng: -122.272747},
    'suisin-city'       : {lat: 38.2382474, lng: -122.040244},
    'daly-city'         : {lat: 37.6879241, lng: -122.4702079},
    'san-diego'         : {lat: 32.715738, lng: -117.1610838}
}

var formattedCityCoordinatesDirectory = {
    'losAngeles'        : {lat : 34.0522342, lng: -118.2436849},
    // Orange County
    'anaheim'           : {lat: 33.8352932, lng: -117.9145036},
    'irvine'            : {lat: 33.6839473, lng: -117.7946942},
    'santaAna'          : {lat: 33.7455731, lng: -117.8678338},
    'walnut'            : {lat: 34.0202894, lng: -117.8653386},
    'longBeach'         : {lat: 33.7700504, lng: -118.1937395},
    'westCovina'        : {lat: 34.0686208, lng: -117.9389526},
    'riverside'         : {lat: 33.9533487, lng: -117.3961564},
    'berkeley'          : {lat: 37.8715926, lng: -122.272747},
    'suisinCity'       : {lat: 38.2382474, lng: -122.040244},
    'dalyCity'         : {lat: 37.6879241, lng: -122.4702079},
    'sanDiego'         : {lat: 32.715738, lng: -117.1610838}
}

var cityToTeamsDirectory = {
    'losAngeles'    : ['aca','samahangModern', 'vsuModern', 'nsuModern', 'foundations', 'chaotic3', 'theMob', 'makerEmpire', 'hallOfFame'],
    'montereyPark'  : ['kinjaz'],
    'walnut'        : ['grv'],
    'anaheim'       : ['teamMillenia'],
    'irvine'        : ['goodProject', 'commonGround', 'kabaModern', 'cadc', 'mcia'],
    'santaAna'      : ['corpsDanceCrew'],
    'longBeach'     : ['pacModern'],
    'westCovina'    : ['barkadaModern', 'theEcsntrcs'],
    'riverside'     : ['nineZeroNineHhdt', 'collectiveFaction'],
    'berkeley'      : ['mainStacks','afx'],
    'suisinCity'    : ['chapkisDanceFam'],
    'dalyCity'      : ['theCompany'],
    'sanDiego'      : ['twoTwenty','ascension','choreoCookies']
}

var fbIdToLocationDirectory = {
    75035611936     : 'losAngeles',
    124327507658376 : 'losAngeles',
    277137469077279 : 'losAngeles',
    349717898382614 : 'losAngeles',
    180722678616577 : 'losAngeles',
    435120296549776 : 'losAngeles',
    1420546741605580: 'losAngeles',
    545398148962340 : 'losAngeles',
    578630488962319 : 'losAngeles',
    163407667011343 : 'montereyPark',
    141226349256771 : 'walnut',
    1402488130022276: 'anaheim',
    806288446138820 : 'irvine',
    715545471897960 : 'irvine',
    1476384099240314: 'irvine',
    55567386213     : 'irvine',
    248079691961571 : 'irvine',
    1636432953249146: 'santaAna',
    1556441934637177: 'longBeach',
    362999867221656 : 'westCovina',
    374511862639598 : 'westCovina',
    122336807845570 : 'riverside',
    494959817196351 : 'riverside',
    251802261644121 : 'berkeley',
    172807799490538 : 'berkeley',
    823512264388397 : 'suisinCity',
    455666954534809 : 'dalyCity',
    77873205278     : 'sanDiego',
    126866124083830 : 'sanDiego',
    578945558851309 : 'sanDiego'
    
    
};

module.exports = {
    teamFbIdDirectory                   : teamFbIdDirectory,
    competitionFbIdDirectory            : competitionFbIdDirectory,
    cityCoordinatesDirectory            : cityCoordinatesDirectory,
    formattedCityCoordinatesDirectory   : formattedCityCoordinatesDirectory,
    cityToTeamsDirectory                : cityToTeamsDirectory,
    fbIdToLocationDirectory             : fbIdToLocationDirectory
}