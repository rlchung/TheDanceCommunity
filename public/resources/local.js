/* global $*/

// init Isotope
var $eventGrid = $('.event-grid').imagesLoaded(function(){
  $eventGrid.isotope({
      itemSelector: '.grid-item',
      layoutMode: 'masonry',
      masonry: {
        columnWidth: 22
      }
  });
});

// bind filter button click
$('#filters').on( 'click', 'button', function() {
  var filterValue = $( this ).attr('data-filter');
  // use filterFn if matches value
  $eventGrid.isotope({ filter: filterValue });
});

// // change is-checked class on buttons
$('#filters button').on('click', function(){
  $('button.is-checked').removeClass('is-checked');
  $(this).addClass('is-checked');
});