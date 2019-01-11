let fromBottom = 10000;
let pageToken = '';
let searchTerm = '';
let requestingVideos = false;
let numRequestsMade = 0;

const DATA = {
  fetchVideos: () => {
    // change requestingVideos to true just before request begins
    requestingVideos = true;


    numRequestsMade++;
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
      pageToken = data.nextPageToken
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
        UI.renderSearchResults(videos.items)
        requestingVideos = false;
      })
    })
  }
}

const UI = {
  search: (event) => {
    event.preventDefault();
    const $searchBar = $('#search-bar');

    // empty pageToken in case there were other searches during same session
    pageToken = '';

    // reset numRequestsMade
    // this variable refers to requests made for one search searchTerm
    // whether it be for the initialrequest or infinite scroll/pagination requests
    numRequestsMade = 0;

    // unfocus text input
    $('input[type=text]').blur();

    // hide the splash screen to make room for results
    $('#splash').hide();

    // Clear search results
    // in case new search is made while results from another search are still on screen
    $("#results").empty().show();

    // Save value of text input to variable
    searchTerm = $searchBar.val();

    // Call funtion to fetch videos
    DATA.fetchVideos();
  },
  renderSearchResults: (videos) => {
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
        .on('click', () => UI.renderModal(video.id));

      $videoTitle
        .addClass('title')
        .text(video.snippet.title)
        .on('click', () => UI.renderModal(video.id));

      $channelViewsPublished
        .addClass('channel-views-published')
        .html(`${video.snippet.channelTitle} &#8226; ${UI.formatViews(video.statistics.viewCount)} views &#8226; ${UI.formatPublishedDate(video.snippet.publishedAt)}`);

      $description
        .addClass('description')
      if (video.snippet.description.length > 150) {
        $description
          .text(video.snippet.description.substring(0, 150).trim() + "...");
      } else {
        $description
          .text(video.snippet.description);
      }

      $infoDiv.append($videoTitle);
      $infoDiv.append($channelViewsPublished);
      $infoDiv.append($description);
      $infoDiv.addClass('info');

      $resultDiv.addClass('result')
      // append image to result div
      $resultDiv.append($thumbnailImg);
      $resultDiv.append($infoDiv);

      $results.append($resultDiv);
    })
  },
  handleOnScroll: () => {
    // Position represents how far the user has scrolled from the top of #results
    const position = ($('#results').scrollTop());

    // Grap the height of the first search result
    const heightOfResult = $('.result:first-of-type').height()

    // find total height of all search results
    // then subtract that total by the height of 4 results
    // this total becomes the threshold, that when passed will request more videos
    const threshold =  ((25 * numRequestsMade) * heightOfResult) - (heightOfResult * 4);

    // determines whether the scroll position has passed the threshold
    let nearBottom = position > threshold;

    // if the scroll position has passed the threshold
    // and if a request for videos is not already taking place
    if (nearBottom && !requestingVideos) {
      // Make a request for more videos
      DATA.fetchVideos()
    }
  },
  renderModal: (videoId) => {
    $('#video-player-container')
      .html(`<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);

    $('#modal')
      .fadeIn();
  },
  hideModal: (event) => {
    $(event.target).fadeOut();
    $('#video-player-container').empty();
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
  /* ====== On Load ====== */

  // Call search function when search/submit button is clicked
  $('.submit').on('click', UI.search);

  // Also calls search function, but handles the case when the user hits the enter key
  $('form.search').on('submit', UI.search);

  // While #results is being scrolled
  // Check to see if the user is near the bottom of the page
  $('#results').scroll(UI.handleOnScroll)

  // when modal is clicked (user clicks off video), hide the modal
  $('#modal').on('click', UI.hideModal)

  // when splash screen magnifying glass is clicked, focus the text input
  $('.glass').on('click', () => $("input[type=text]").focus())

  // when logo in nav is clicked, hide #results and show splash screen
  $('.brand').on('click', () => {
    $('#results').empty().hide();
    $('#splash').show();
  })
})
