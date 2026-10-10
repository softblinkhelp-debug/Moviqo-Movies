const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const cards = [...document.querySelectorAll('.movie-card')];
const noResults = document.getElementById('noResults');
const genreButtons = [...document.querySelectorAll('[data-genre-filter]')];
let activeGenre = '';

function filterMovies() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  cards.forEach(card => {
    const title = card.dataset.title.toLowerCase();
    const genre = card.dataset.genre.toLowerCase();
    const matchesQuery = !query || title.includes(query) || genre.includes(query);
    const matchesGenre = !activeGenre || genre.includes(activeGenre.toLowerCase());
    const show = matchesQuery && matchesGenre;
    card.hidden = !show;
    if (show) visible++;
  });
  noResults.hidden = visible > 0;
}
searchInput.addEventListener('input', filterMovies);
clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  activeGenre = '';
  genreButtons.forEach(b => b.classList.remove('selected'));
  filterMovies();
  searchInput.focus();
});
document.getElementById('focusSearch').addEventListener('click', () => {
  searchInput.focus();
  window.scrollTo({top: 0, behavior: 'smooth'});
});
genreButtons.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.genreFilter;
  activeGenre = activeGenre === selected ? '' : selected;
  genreButtons.forEach(b => b.classList.toggle('selected', b.dataset.genreFilter === activeGenre));
  filterMovies();
  document.getElementById('trending').scrollIntoView({behavior:'smooth'});
}));
