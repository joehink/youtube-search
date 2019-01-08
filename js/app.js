const DATA = {
  fetchVideos: (searchTerm) => {
    $.ajax({
      url: 'https://www.googleapis.com/youtube/v3/search',
      data: {
        key: "AIzaSyBPGEpGKGEMMVUPgwNRCDMI29MzQWVhWdg",
        part: "snippet",
        maxResults: 25,
        q: searchTerm
      }
    }).then(data => {
      UI.renderSearchResults(data.items)
    })
  }
}

const UI = {
  search: (event) => {
    event.preventDefault();
    const $searchBar = $('#search-bar');

    // Save value of search bar to variable
    const searchTerm = $searchBar.val();

    // Call funtion to fetch
    DATA.fetchVideos(searchTerm);
  },
  renderSearchResults: (videos) => {
    const $results = $('#results');
    console.log(videos);
    $.each(videos, (i, video) => {
      // === create elements for vidoe result ===
      const $resultDiv = $('<div>');
      const $infoDiv = $('<div>');
      const $thumbnailImg = $('<img>');
      const $videoTitle = $('<h3>');
      const $channelAndViews = $('<p>');
      const $description = $('<p>');

      // append image to result div
      $thumbnailImg.attr('src', video.snippet.thumbnails.medium.url)

      $videoTitle.text(video.snippet.title);

      $infoDiv.append($videoTitle);

      $resultDiv.append($thumbnailImg);
      $resultDiv.append($infoDiv);

      $results.append($resultDiv);
    })
  }
};

$(() => {
  // Call search function when search form is submitted
  $('form.search').on('submit', UI.search);
})
