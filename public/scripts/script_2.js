$(document).scroll(function() {
  var y = $(this).scrollTop();
  console.log($('#main-title').offset().top);
  if (y > $('#main-title').offset().top) {
    $('#logo').fadeIn();
  } else {
    $('#logo').fadeOut();
  }
});