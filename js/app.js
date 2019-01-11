// stores next page token after every search request
let pageToken = '';

// saves search term after every search
let searchTerm = '';

// requestingVideos helps prevent
// simulatneous requests for more videos during scroll event
let requestingVideos = false;

// this variable tracks the number of requests made for one search searchTerm
// whether it be for the initial request or infinite scroll/pagination requests
let numRequestsMade = 0;



const DATA = {
  fetchVideos: () => {
    // change requestingVideos to true just before request begins
    requestingVideos = true;

    // increment by 1 to keep track of requests made for current search term
    numRequestsMade++;

    /*=====================================================================
      Make search request for 25 videos
      if pageToken is blank (it will be on first request for new searchTerm)
      API will still return first page of results
      pageToken will be given value after first request
      and subsequent requests will return next page of results
      =====================================================================*/
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
      // save token for next page of search results
      pageToken = data.nextPageToken

      // create array of IDs of videos from search request
      const videoIds = data.items.map(video => {
        return video.id.videoId;
      })

      /*=========================================================
        search request does not return number of views per video
        so another request must be made for each video
        provide array of IDs to return all videos from search in one request
        ===================================================================*/
      $.ajax({
        url: "https://www.googleapis.com/youtube/v3/videos",
        data: {
          key: "AIzaSyBPGEpGKGEMMVUPgwNRCDMI29MzQWVhWdg",
          part: "snippet,statistics",
          id: videoIds.toString()
        }
      }).then(videos => {
        // call function to render videos to the screen
        UI.renderSearchResults(videos.items)

        // set requestingVideos to false now that requests have ended
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
      // === create elements for video result ===
      const $resultDiv = $('<div>');
      const $infoDiv = $('<div>');
      const $thumbnailImg = $('<img>');
      const $videoTitle = $('<h3>');
      const $channelViewsPublished = $('<p>');
      const $description = $('<p>');
      // ========================================

      // create img element for thumbnail
      // when clicked, render modal with playable video
      $thumbnailImg
        .addClass('thumbnail')
        .attr('src', video.snippet.thumbnails.medium.url)
        .on('click', () => UI.renderModal(video.id));

      // create h3 element for title
      // when clicked, render modal with playable video
      $videoTitle
        .addClass('title')
        .text(video.snippet.title)
        .on('click', () => UI.renderModal(video.id));

      // create p element for channel name, views, and time since published
      $channelViewsPublished
        .addClass('channel-views-published')
        .html(`${video.snippet.channelTitle} &#8226; ${UI.formatViews(video.statistics.viewCount)} views &#8226; ${UI.formatPublishedDate(video.snippet.publishedAt)}`);

      // create p element for description
      $description
        .addClass('description')

      // if the description is longer than 150 characters
      if (video.snippet.description.length > 150) {
        // return the first 150 characters + "..."
        $description
          .text(video.snippet.description.substring(0, 150).trim() + "...");
      } else {
        // return full description
        $description
          .text(video.snippet.description);
      }

      //=== append elements to create full search result ===
      $infoDiv.append($videoTitle);
      $infoDiv.append($channelViewsPublished);
      $infoDiv.append($description);
      $infoDiv.addClass('info');

      $resultDiv.addClass('result')
      $resultDiv.append($thumbnailImg);
      $resultDiv.append($infoDiv);

      $results.append($resultDiv);
      //=====================================================
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
    // append iframe with video to modal
    $('#video-player-container')
      .html(`<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);

    // show modal
    $('#modal')
      .fadeIn();
  },
  hideModal: (event) => {
    // fade out modal
    $(event.target).fadeOut();

    // remove iframe of video
    $('#video-player-container').empty();
  },
  formatViews: (views) => {
    // if views > 1 billion
    if (views > 999999999) {
        // divide views by 1 billion and add "B", ex: 1.2B views
        return parseFloat((views / 1000000000).toFixed(1)) + "B"
    }

    // if views > 1 million
    if (views > 999999) {
        // divide views by 1 million and add "M", ex: 6.7M views
        return parseFloat((views / 1000000).toFixed(1)) + "M"
    }

    // if views > 1 thousand
    if (views > 999) {
        // divide views by 1 thousand and add "K", ex: 102.5K views
        return parseFloat((views / 1000).toFixed(1)) + "K"
    }

    // if views is in the hundreds
    // just return views, ex: 978 views
    return views;
  },
  timeSincePublished: (secondsSincePublished, intervalSeconds, intervalName) => {
    // divide number of seconds since published
    // by intervalSeconds (seconds in year, month, day, hour, or minute)
    // timeElapsed equals rounded number of years, months, days, hours, or minutes
    // formula from https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
    let timeElapsed = Math.floor(secondsSincePublished/intervalSeconds);

    if (timeElapsed === 1) {
      // ex: 1 month ago
      return `${timeElapsed} ${intervalName} ago`;
    } else {
      // ex: 2 years ago
      return `${timeElapsed} ${intervalName + "s"} ago`;
    }
  },
  formatPublishedDate: (datePublished) => {
    const secondsInYear = 31536000;
    const secondsInMonth = 2629746;
    const secondsInWeek = 604800;
    const secondsInDay = 86400;
    const secondsInHour = 3600;
    const secondsInMinute = 60;

    // subtract (datePublished / 1000) from current date
    // to get number of seconds since video was published
    // formula from: https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
    const seconds = Math.floor(((new Date() - new Date(datePublished)) / 1000));

    if (seconds >= secondsInYear) {
      // calculate years since published
      return UI.timeSincePublished(seconds, secondsInYear, "year");
    }

    if (seconds >= secondsInMonth) {
      // calculate months since published
      return UI.timeSincePublished(seconds, secondsInMonth, "month");
    }

    if (seconds >= secondsInWeek) {
      // calculate weeks since published
      return UI.timeSincePublished(seconds, secondsInWeek, "week");
    }

    if (seconds >= secondsInDay) {
      // calculate days since published
      return UI.timeSincePublished(seconds, secondsInDay, "day");
    }

    if (seconds >= secondsInHour) {
      // calculate hours since published
      return UI.timeSincePublished(seconds, secondsInHour, "hour");
    }

    if (seconds >= secondsInMinute) {
      // calculate minutes since published
      return UI.timeSincePublished(seconds, secondsInMinute, "minute");
    }

    // if seconds > one minute
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
  $('.glass').on('click', () => {
    $("#search-bar").focus();
  });

  // when logo in nav is clicked, hide #results and show splash screen
  $('.brand').on('click', () => {
    $('#results').empty().hide();
    $('#splash').show();
  })
})
