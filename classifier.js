var natural     = require('natural'),
    classifier  = new natural.BayesClassifier();
    
// file contents used to create a classifier.json that will be used to classify event titles
    
// // 'audition' training
// classifier.addDocument("ACA Hip Hop Fall Auditions 2014", 'audition');
// classifier.addDocument("ACA Hip Hop Midyear Auditions Winter 2015", 'audition');
// classifier.addDocument("GRaVy Babies Fall Auditions", 'audition');
// classifier.addDocument("Team Millennia Family Auditions 2016-2017", 'audition');
// classifier.addDocument("TM Juniors Midyear Auditions", 'audition');
// classifier.addDocument("Chaotic 3 Spring 2016 Pre-Season Workshops & Auditions", 'audition');
// classifier.addDocument("Chaotic 3 Auditions", 'audition');
// classifier.addDocument("FC Summer 2016 Team Auditions", 'audition');
// classifier.addDocument("Foundations Choreography Winter 2016 Auditions", 'audition');

// // 'workshop' training
// classifier.addDocument("ACA Hip Hop | Summer Workshop Series 2016", 'workshop');
// classifier.addDocument("ACA Hip Hop | Summer Workshop Series '15", 'workshop');
// classifier.addDocument("Chaotic 3 Weekly Workshops PT2", 'workshop');
// classifier.addDocument("Samahang Modern's Summer Workshops!", 'workshop');
// classifier.addDocument("Samahang Modern Friday Night Workhops", 'workshop');
// classifier.addDocument("Chaotic 3 Pre-Audition Workshops", 'workshop');
// classifier.addDocument("Pre-Audition Workshops", 'workshop');
// classifier.addDocument("FC Summer 2016 Beginner Dance Workshops", 'workshop');

// // 'other' training
// classifier.addDocument("ACA Friends & Family Night Spring 2016", 'other');
// classifier.addDocument("ACA Beanie Fundraiser!!", 'other');
// classifier.addDocument("Chaotic 3 Fall 2015 Friends & Family Night", 'other');
// classifier.addDocument("Samahang Modern | A New T-shirt Line!", 'other');
// classifier.addDocument("Samahang Modern | Friends and Family Night!", 'other');
// classifier.addDocument("Samahang Modern Has Porto's: A Fundraiser!", 'other');
// classifier.addDocument("Ignite: Foundations Choreography Spring 2016 Exhibition", 'other');

// classifier.train();