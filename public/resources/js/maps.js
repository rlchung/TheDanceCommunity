var input = document.getElementById("pac-input");
var options = {
    componentRestrictions: {country: 'US'}  
};
var autocomplete = new google.maps.places.Autocomplete(input, options);