# TheDanceCommunity

[Live link](https://guarded-garden-96808.herokuapp.com/)

##Introduction
TheDanceCommunity(TDC) is a MEN Stack application that helps urban community dancers in California find local dance events.

![TheDanceCommunity Demo](http://res.cloudinary.com/dce6r25eh/image/upload/v1480542964/TDC_demo_ertst9.png)

##Implementation
TheDanceCommunity pulls current community dance events through the Facebook Graph API whenever a user queries for events in a given locality. User queries are then geocoded through the Google Maps API to fetch events around their area; per fetch, event information is: (1) updated if it already exists in the database, (2) deleted if it is outdated for more than 2 weeks, or (3) saved if it is a new event.

##Usage
* Enter OAuth credentials in credentials.js and configure hosting address if need be.
* From project root, run `node app.js` (Also make sure that Mongod database is running)
* Visit appropriate host address

##In-progress
* BUG: inaccurate display of expired events due to time zone nuances
* BUG: inaccurate classification patterns with auditions and other events
* Expanding app data to serve in more localities
* Adding in Competition Series event header
