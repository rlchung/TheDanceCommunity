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
// classifier.addDocument("Samahang Modern '16-'17 Auditions!", 'audition');
// classifier.addDocument("The GOOD Project Recruitment Night", 'audition');
// classifier.addDocument("Team Millennia Family Auditions 2016-2017", 'audition');
// classifier.addDocument("GRV FALL Auditions 2016", 'audition');
// classifier.addDocument("The Corps Dance Crew Auditions", 'audition');
// classifier.addDocument(['AUDITIONS', 'AUDIITON', 'Auditions', 'audition',
//                         'PRE-AUDITIONS', 'PREAUDITIONS', 'PRE-AUDITION', 'PREAUDITION',
//                         'Pre-auditions', 'Preauditions', 'pre-audition', 'preaudition',
//                         'Coronation', 'scouting', 'recruitment', 'Recruitment', 
//                         'Mid-years', 'Mid-year', 'Midyear', 'Midyears',
//                         'Audition Workshops', 'Audition Workshop', 'Preaudition Workshop',
//                         'Pre-audition workshop', 'Pre-Audition workshop', 'Pop-up Workshop'], 'audition');

// // // 'workshop' training
// classifier.addDocument("ACA Hip Hop | Summer Workshop Series 2016", 'workshop');
// classifier.addDocument("ACA Hip Hop | Summer Workshop Series '15", 'workshop');
// classifier.addDocument("Chaotic 3 Weekly Workshops PT2", 'workshop');
// classifier.addDocument("Samahang Modern's Summer Workshops!", 'workshop');
// classifier.addDocument("Samahang Modern Friday Night Workhops", 'workshop');
// classifier.addDocument("Chaotic 3 Pre-Audition Workshops", 'workshop');
// classifier.addDocument("Pre-Audition Workshops", 'workshop');
// classifier.addDocument("FC Summer 2016 Beginner Dance Workshops", 'workshop');
// classifier.addDocument("CADC August Workshops!", 'workshop');
// classifier.addDocument("BMOD XII Workshops", 'workshop');
// classifier.addDocument(['Workshops', 'Workshop', 'workshops', 'workshop',
//                         'Dance', 'Summer', 'Winter', 'Spring', 'series', 'class', 'rehearsal'], 'workshop');

// // // 'other' training
// classifier.addDocument("ACA Friends & Family Night Spring 2016", 'other');
// classifier.addDocument("ACA Beanie Fundraiser!!", 'other');
// classifier.addDocument("Chaotic 3 Fall 2015 Friends & Family Night", 'other');
// classifier.addDocument("Samahang Modern | A New T-shirt Line!", 'other');
// classifier.addDocument("Samahang Modern | Friends and Family Night!", 'other');
// classifier.addDocument("Samahang Modern Has Porto's: A Fundraiser!", 'other');
// classifier.addDocument("Ignite: Foundations Choreography Spring 2016 Exhibition", 'other');
// classifier.addDocument(['Fundraiser', 'fundraiser', 'friends and family', 
//                         'donuts', 'T-shirts', 'shirts', 'exhibition', 'showcase', 'show'], 'other');

// classifier.train();

// classifier.save('classifier.json', function(err, classifier){
//     if(err) console.log(err);
//     console.log("classifier saved!"); 
// });