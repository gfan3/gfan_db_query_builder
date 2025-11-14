//
// Place any custom JS here
//


$('.dropdown-item').on('click', function () {
  const value = $(this).data('value');
  $('#dropdownBtn').text(value);
});
