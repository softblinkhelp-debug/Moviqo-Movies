
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const movieGrid = document.getElementById("movieGrid");
const noResults = document.getElementById("noResults");
const genreButtons = [...document.querySelectorAll("[data-genre-filter]")];

let activeGenre = "";

function filterMovies() {
  const query = searchInput.value.trim().toLowerCase();
  const cards = [...movieGrid.querySelectorAll(".movie-card")];
  let visible = 0;

  cards.forEach((card) => {
    const title = (card.dataset.title || "").toLowerCase();
    const genre = (card.dataset.genre || "").toLowerCase();
    const matchesQuery = !query || title.includes(query);
    const matchesGenre = !activeGenre ||
      genre.includes(activeGenre.toLowerCase());
    const show = matchesQuery && matchesGenre;

    card.hidden = !show;
    if (show) visible++;
  });

  noResults.hidden = visible > 0;
}

searchInput.addEventListener("input", filterMovies);

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  activeGenre = "";
  genreButtons.forEach((button) => button.classList.remove("selected"));
  filterMovies();
  searchInput.focus();
});

document.getElementById("focusSearch").addEventListener("click", () => {
  searchInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

genreButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.genreFilter;
    activeGenre = activeGenre === selected ? "" : selected;

    genreButtons.forEach((item) => {
      item.classList.toggle(
        "selected",
        item.dataset.genreFilter === activeGenre
      );
    });

    filterMovies();
    document.getElementById("trending").scrollIntoView({
      behavior: "smooth"
    });
  });
});

// Fetch movie titles from Wikidata.
// Existing cards stay in place if the request fails.
async function loadWikidataMovies() {
  const endpoint = "https://query.wikidata.org/sparql";
  const query = `
    SELECT ?movie ?movieLabel ?date WHERE {
      ?movie wdt:P31 wd:Q11424;
             wdt:P577 ?date.
      SERVICE wikibase:label {
        bd:serviceParam wikibase:language "en".
      }
    }
    ORDER BY DESC(?date)
    LIMIT 20
  `;

  try {
    const url = endpoint + "?query=" +
      encodeURIComponent(query) + "&format=json";

    const response = await fetch(url, {
      headers: { Accept: "application/sparql-results+json" }
    });

    if (!response.ok) throw new Error("Movie data request failed");

    const data = await response.json();
    const movies = data.results.bindings;

    if (!movies.length) return;

    // Replace demo cards only after real data has loaded.
    movieGrid.replaceChildren();

    movies.forEach((item) => {
      const title = item.movieLabel.value;
      const year = item.date?.value?.slice(0, 4) || "";
      const card = document.createElement("article");
      card.className = "movie-card";
      card.dataset.title = title;
      card.dataset.genre = "";

      const poster = document.createElement("div");
      poster.className = "movie-poster";
      const posterTitle = document.createElement("div");
      posterTitle.className = "poster-title";
      posterTitle.textContent = title;
      poster.appendChild(posterTitle);

      const info = document.createElement("div");
      info.className = "movie-info";
      const details = document.createElement("div");
      const heading = document.createElement("h3");
      heading.textContent = title;
      const description = document.createElement("p");
      description.textContent = year ? `Released ${year}` : "Movie";
      details.append(heading, description);
      info.appendChild(details);
      card.append(poster, info);
      movieGrid.appendChild(card);
    });

    filterMovies();
  } catch (error) {
    console.warn("Wikidata unavailable; keeping demo cards.", error);
  }
}

loadWikidataMovies();
