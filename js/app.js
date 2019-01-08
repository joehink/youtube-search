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
    $.each(videos, video => {
      const $resultDiv = $('<div>');
      const $thumbnailImg = $('<div>');
      const $infoDiv = $('<div>');
      
    })
  }
};

$(() => {
  // Call search function when search form is submitted
  $('form.search').on('submit', UI.search);
})
