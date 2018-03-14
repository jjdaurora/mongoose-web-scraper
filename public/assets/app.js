$(document).on("click", "#save-headline-btn", function() {
 
  event.preventDefault();

  var savedId = $(this).parent().attr("data-id");

  $.ajax({
    method: "POST",
    url: "/saved/" + savedId,
    data: {
      // Value taken from title input
      title: $(".headline-title").val(),
      // Value taken from note textarea
      author: $(".article-title").val()
    }
  })
  .then(function(data) {
    // Log the response
    console.log(data);
    // Empty the notes section
  });

});

$(document).on("click", ".delete-headline-btn", function() {

  var deletedHeadline = $(this).parent().attr("data-id");

    $.ajax({
      method: "POST",
      url: "/delete/" + deletedHeadline,
      data: {
        // Value taken from title input
        title: $(".headline-title").val(),
        // Value taken from note textarea
        author: $(".article-title").val()
      }
    }).then(function(data) {
      // Log the response
      console.log(data);

      window.location.assign("/saved")
      // Empty the notes section
    });

});
