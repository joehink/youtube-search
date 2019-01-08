const DATA = {
  fetchVideos: (searchTerm) => {
    $.ajax({
      url: 'https://www.googleapis.com/youtube/v3/search',
      data: {
        key: "AIzaSyBPGEpGKGEMMVUPgwNRCDMI29MzQWVhWdg",
        part: "snippet",
        type: "video",
        maxResults: 25,
        q: searchTerm
      }
    }).then(data => {
      const videoIds = data.items.map(video => {
        return video.id.videoId;
      })
      $.ajax({
        url: "https://www.googleapis.com/youtube/v3/videos",
        data: {
          key: "AIzaSyBPGEpGKGEMMVUPgwNRCDMI29MzQWVhWdg",
          part: "snippet,statistics",
          id: videoIds.toString()
        }
      }).then(videos => {
        console.log(videos);
        UI.renderSearchResults(videos.items)
      })
    })
  }
}

const UI = {
  search: (event) => {
    event.preventDefault();
    const $searchBar = $('#search-bar');

    // Clear search $results
    $("#results").empty();

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


      $thumbnailImg.attr('src', video.snippet.thumbnails.medium.url)

      $videoTitle.text(video.snippet.title);

      $channelAndViews
        .html(`${video.snippet.channelTitle} &#8226; ${video.statistics.viewCount} views`)

      $infoDiv.append($videoTitle);
      $infoDiv.append($channelAndViews);

      // append image to result div
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
