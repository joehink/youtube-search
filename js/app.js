const DATA = {
  fetchVideos: (searchTerm, pageToken) => {
    $.ajax({
      url: 'https://www.googleapis.com/youtube/v3/search',
      data: {
        key: "AIzaSyBPGEpGKGEMMVUPgwNRCDMI29MzQWVhWdg",
        part: "snippet",
        type: "video",
        maxResults: 25,
        q: searchTerm,
        pageToken: pageToken
      }
    }).then(data => {
      const nextPageToken = data.nextPageToken
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
        UI.renderSearchResults(videos.items, searchTerm, nextPageToken)
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
  renderSearchResults: (videos, searchTerm, nextPageToken) => {
    const $results = $('#results');
    $.each(videos, (i, video) => {
      // === create elements for vidoe result ===
      const $resultDiv = $('<div>');
      const $infoDiv = $('<div>');
      const $thumbnailImg = $('<img>');
      const $videoTitle = $('<h3>');
      const $channelViewsPublished = $('<p>');
      const $description = $('<p>');


      $thumbnailImg
        .addClass('thumbnail')
        .attr('src', video.snippet.thumbnails.medium.url)

      $videoTitle
        .addClass('title')
        .text(video.snippet.title);

      $channelViewsPublished
        .addClass('channel-views-published')
        .html(`${video.snippet.channelTitle} &#8226; ${UI.formatViews(video.statistics.viewCount)} views &#8226; ${UI.formatPublishedDate(video.snippet.publishedAt)}`);

      $description
        .addClass('description')
        .text(video.snippet.description);

      $infoDiv.append($videoTitle);
      $infoDiv.append($channelViewsPublished);
      $infoDiv.append($description);

      $resultDiv.addClass('result')
      // append image to result div
      $resultDiv.append($thumbnailImg);
      $resultDiv.append($infoDiv);

      $results.append($resultDiv);
    })
    $results.append($('<span>next page</span>').on('click',() => {
      DATA.fetchVideos(searchTerm, nextPageToken);
    }))
  },
  formatViews: (views) => {
    if (views > 999999999) {
        return parseFloat((views / 1000000000).toFixed(1)) + "B"
    }
    if (views > 999999) {
        return parseFloat((views / 1000000).toFixed(1)) + "M"
    }
    if (views > 999) {
        return parseFloat((views / 1000).toFixed(1)) + "K"
    }

    return views;
  },
  formatPublishedDate: (datePublished) => {
    const seconds = Math.floor(((new Date() - new Date(datePublished)) / 1000));
    const secondsInYear = 31536000;
    const secondsInMonth = 2629746;
    const secondsInWeek = 604800;
    const secondsInDay = 86400;
    const secondsInHour = 3600;
    const secondsInMinute = 60;

    let timeElapsed = Math.floor(seconds/secondsInYear);

    if (timeElapsed >= 1) {
      return timeElapsed === 1 ? `${timeElapsed} year ago` : `${timeElapsed} years ago`;
    }

    timeElapsed = Math.floor(seconds/secondsInMonth)

    if (timeElapsed >= 1) {
      return timeElapsed === 1 ? `${timeElapsed} month ago` : `${timeElapsed} months ago`
    }

    timeElapsed = Math.floor(seconds/secondsInWeek);

    if (timeElapsed >= 1) {
      return timeElapsed === 1 ? `${timeElapsed} week ago` : `${timeElapsed} weeks ago`
    }

    timeElapsed = Math.floor(seconds/secondsInDay);

    if (timeElapsed >= 1) {
      return timeElapsed === 1 ? `${timeElapsed} day ago` : `${timeElapsed} days ago`
    }

    timeElapsed = Math.floor(seconds/secondsInHour);

    if (timeElapsed >= 1) {
      return timeElapsed === 1 ? `${timeElapsed} hour ago` : `${timeElapsed} hours ago`
    }

    timeElapsed = Math.floor(seconds/secondsInMinute);

    if (timeElapsed >= 1) {
      return timeElapsed === 1 ? `${timeElapsed} minute ago` : `${timeElapsed} minutes ago`
    }

    return "Just now"

  }
};

$(() => {
  // Call search function when search form is submitted
  $('form.search').on('submit', UI.search);
})
