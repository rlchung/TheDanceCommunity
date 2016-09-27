/* global $*/

// init Isotope
var $Grid = $('.grid').imagesLoaded(function(){
  $Grid.isotope({
      itemSelector: '.grid-item',
      layoutMode: 'masonry',
      getSortData: {
        name: '.name'
      },
      masonry: {
        columnWidth: 22
      }
  });
});

// bind filter button click
$('#filters').on( 'click', 'button', function() {
  var filterValue = $( this ).attr('data-filter');
  // use filterFn if matches value
  $Grid.isotope({ filter: filterValue });
});

// bind sort button click
$('#sorts').on( 'click', 'button', function() {
  var sortByValue = $(this).attr('data-sort-by');
  $Grid.isotope({ sortBy: sortByValue });
});

// // change is-checked class on buttons
$('#filters button').on('click', function(){
  $('button.is-checked').removeClass('is-checked');
  $(this).addClass('is-checked');
});

$('#sorts button').on('click', function(){
  $('button.is-checked').removeClass('is-checked');
  $(this).addClass('is-checked');
});