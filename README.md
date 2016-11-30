# TheDanceCommunity

[Live link](https://guarded-garden-96808.herokuapp.com/)

##Introduction
TheDanceCommunity(TDC) is a MEN Stack application that helps urban community dancers in southern California find local dance events.

##Implementation
TheDanceCommunity pulls current community dance events through the Facebook Graph API whenever a user queries for events in a given locality. User queries are then geocoded through the Google Maps API to fetch events around their area; per fetch, event information is updated if it already exists in the database, deleted if it is outdated for more than 2 weeks, or saved if it a new event.

##Usage
* Enter OAuth credentials in credentials.js and configure hosting address if need be.
* From project root, run `node app.js` (Also make sure that Mongod database is running)
* Visit appropriate host address

##In-progress
* BUG: inaccuate display of expired events due to time zone nuances
* BUG: inaccuate classification patterns with audition and etc. events
* Expanding app data to serve in more localities
* Adding in Competition Series event header
