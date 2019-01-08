const data = {
  fetchVideos: (searchTerm) => {
    console.log(searchTerm);
  }
}

const video = {
  search: (event) => {
    event.preventDefault();
    const $searchBar = $('#search-bar');
    const searchTerm = $searchBar.val()

    data.fetchVideos(searchTerm)
  }
};

$(() => {
  $('form.search').on('submit', video.search);
})
