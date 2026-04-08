// // API Config
// const API_KEY = "1bb9bf58";
// const BASE_URL = "https://www.omdbapi.com/";

// // State
// let allMovies = [];
// let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");

// // DOM
// const searchInput    = document.getElementById("search-input");
// const searchBtn      = document.getElementById("search-btn");
// const moviesGrid     = document.getElementById("movies-grid");
// const watchlistGrid  = document.getElementById("watchlist-grid");
// const loadingEl      = document.getElementById("loading");
// const emptyWatchlist = document.getElementById("empty-watchlist");
// const sectionTitle   = document.getElementById("section-title");

// // Fetch movies from OMDB API
// async function fetchMovies(query) {
//   loadingEl.classList.remove("hidden");
//   moviesGrid.innerHTML = "";
//   sectionTitle.textContent = `Results for "${query}"`;

//   try {
//     const res  = await fetch(`${BASE_URL}?s=${query}&type=movie&apikey=${API_KEY}`);
//     const data = await res.json();

//     loadingEl.classList.add("hidden");

//     if (data.Response === "False") {
//       moviesGrid.innerHTML = `<p style="color:#aaa;">No results found for "${query}"</p>`;
//       return;
//     }

//     // Fetch full details for each movie
//     const detailPromises = data.Search.map(movie =>
//       fetch(`${BASE_URL}?i=${movie.imdbID}&apikey=${API_KEY}`).then(r => r.json())
//     );

//     allMovies = await Promise.all(detailPromises);
//     renderMovies(allMovies);

//   } catch (err) {
//     loadingEl.classList.add("hidden");
//     moviesGrid.innerHTML = `<p style="color:#aaa;">Something went wrong. Try again.</p>`;
//   }
// }

// // Render movie cards
// function renderMovies(movies) {
//   moviesGrid.innerHTML = "";

//   if (!movies.length) {
//     moviesGrid.innerHTML = `<p style="color:#aaa;">No movies to show.</p>`;
//     return;
//   }

//   movies.forEach(movie => {
//     const inWatchlist = watchlist.some(w => w.imdbID === movie.imdbID);

//     const card = document.createElement("div");
//     card.className = "movie-card";
//     card.innerHTML = `
//       ${movie.Poster !== "N/A"
//         ? `<img src="${movie.Poster}" alt="${movie.Title}" />`
//         : `<div class="no-poster">🎬</div>`
//       }
//       <div class="card-body">
//         <div class="card-title">${movie.Title}</div>
//         <div class="card-meta">⭐ ${movie.imdbRating || "N/A"} | ${movie.Year}</div>
//         <div class="card-btns">
//           <button class="btn-add" onclick="toggleWatchlist('${movie.imdbID}')">
//             ${inWatchlist ? "❌ Remove" : "➕ Watchlist"}
//           </button>
//           <button class="btn-imdb" onclick="openIMDb('${movie.imdbID}')">🎬 IMDb</button>
//         </div>
//       </div>
//     `;
//     moviesGrid.appendChild(card);
//   });
// }

// // Add/Remove from watchlist
// function toggleWatchlist(imdbID) {
//   const movie  = allMovies.find(m => m.imdbID === imdbID);
//   const exists = watchlist.some(w => w.imdbID === imdbID);

//   if (exists) {
//     watchlist = watchlist.filter(w => w.imdbID !== imdbID);
//   } else {
//     watchlist.push(movie);
//   }

//   localStorage.setItem("watchlist", JSON.stringify(watchlist));
//   renderMovies(allMovies);
//   renderWatchlist();
// }

// // Render watchlist
// function renderWatchlist() {
//   watchlistGrid.innerHTML = "";

//   if (!watchlist.length) {
//     emptyWatchlist.style.display = "block";
//     return;
//   }

//   emptyWatchlist.style.display = "none";

//   watchlist.forEach(movie => {
//     const card = document.createElement("div");
//     card.className = "movie-card";
//     card.innerHTML = `
//       ${movie.Poster !== "N/A"
//         ? `<img src="${movie.Poster}" alt="${movie.Title}" />`
//         : `<div class="no-poster">🎬</div>`
//       }
//       <div class="card-body">
//         <div class="card-title">${movie.Title}</div>
//         <div class="card-meta">⭐ ${movie.imdbRating || "N/A"} | ${movie.Year}</div>
//         <div class="card-btns">
//           <button class="btn-add" onclick="toggleWatchlist('${movie.imdbID}')">❌ Remove</button>
//           <button class="btn-imdb" onclick="openIMDb('${movie.imdbID}')">🎬 IMDb</button>
//         </div>
//       </div>
//     `;
//     watchlistGrid.appendChild(card);
//   });
// }

// // Open IMDb
// function openIMDb(imdbID) {
//   window.open(`https://www.imdb.com/title/${imdbID}`, "_blank");
// }

// // Search
// searchBtn.addEventListener("click", () => {
//   const q = searchInput.value.trim();
//   if (!q) return;
//   fetchMovies(q);
// });

// searchInput.addEventListener("keydown", e => {
//   if (e.key === "Enter") {
//     const q = searchInput.value.trim();
//     if (!q) return;
//     fetchMovies(q);
//   }
// });

// // Init
// renderWatchlist();



const API_KEY = "1bb9bf58"
const BASE_URL = "https://www.omdbapi.com/"


// movie list and saved data
let allMovies = []
let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]")
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]")


// page elements
let searchInput = document.getElementById("search-input")
let searchBtn = document.getElementById("search-btn")
let moviesGrid = document.getElementById("movies-grid")
let watchlistGrid = document.getElementById("watchlist-grid")
let loadingEl = document.getElementById("loading")
let emptyMsg = document.getElementById("empty-msg")
let resultsTitle = document.getElementById("results-title")
let genreFilter = document.getElementById("genre-filter")
let sortBy = document.getElementById("sort-by")
let themeBtn = document.getElementById("theme-btn")


// fetch movies from omdb api
async function fetchMovies(query) {

  loadingEl.classList.remove("hidden")
  moviesGrid.innerHTML = ""
  resultsTitle.textContent = `Results for "${query}"`

  try {

    const url = `${BASE_URL}?s=${query}&type=movie&apikey=${API_KEY}`
    const res = await fetch(url)
    const data = await res.json()

    loadingEl.classList.add("hidden")

    if (data.Response === "False") {
      moviesGrid.innerHTML = `<p style="color:#aaa;">No movies found for "${query}"</p>`
      return
    }

    // get full details for each movie using map() HOF
    const requests = data.Search.map(movie =>
      fetch(`${BASE_URL}?i=${movie.imdbID}&apikey=${API_KEY}`).then(r => r.json())
    )

    allMovies = await Promise.all(requests)

    renderMovies(allMovies)

  } catch (err) {

    loadingEl.classList.add("hidden")
    moviesGrid.innerHTML = `<p style="color:#aaa;">Something went wrong, try again.</p>`

  }

}


// put movie cards on screen
function renderMovies(list) {

  moviesGrid.innerHTML = ""

  if (!list || list.length === 0) {
    moviesGrid.innerHTML = `<p style="color:#aaa;">No movies to show.</p>`
    return
  }

  list.forEach(movie => {

    const inWatchlist = watchlist.some(w => w.imdbID === movie.imdbID)
    const isFav = favorites.some(f => f.imdbID === movie.imdbID)

    const card = document.createElement("div")
    card.className = "movie-card"

    let poster = ""

    if (movie.Poster && movie.Poster !== "N/A") {
      poster = `<img src="${movie.Poster}" alt="${movie.Title}" />`
    } else {
      poster = `<div class="no-poster">🎬</div>`
    }

    card.innerHTML = `
      ${poster}
      <div class="card-body">
        <div class="card-title">${movie.Title}</div>
        <div class="card-meta">⭐ ${movie.imdbRating || "N/A"} &nbsp;|&nbsp; ${movie.Year} &nbsp;|&nbsp; ${movie.Genre ? movie.Genre.split(",")[0] : "N/A"}</div>
        <div class="card-btns">
          <button class="btn-add" onclick="toggleWatchlist('${movie.imdbID}')">
            ${inWatchlist ? "❌ Remove" : "➕ Watchlist"}
          </button>
          <button class="btn-fav" onclick="toggleFav('${movie.imdbID}')">
            ${isFav ? "💛 Unfavourite" : "🤍 Favourite"}
          </button>
          <button class="btn-imdb" onclick="openIMDb('${movie.imdbID}')">
            🎬 IMDb
          </button>
        </div>
      </div>
    `

    moviesGrid.appendChild(card)

  })

}


// filter and sort using HOFs
function applyFilter() {

  const selectedGenre = genreFilter.value
  const selectedSort = sortBy.value

  // filter() HOF — genre filter
  let filtered = allMovies.filter(movie => {
    if (!selectedGenre) return true
    return movie.Genre && movie.Genre.includes(selectedGenre)
  })

  // sort() HOF — sorting
  filtered = filtered.sort((a, b) => {

    if (selectedSort === "rating") {
      return parseFloat(b.imdbRating || 0) - parseFloat(a.imdbRating || 0)
    }

    if (selectedSort === "year") {
      return parseInt(b.Year || 0) - parseInt(a.Year || 0)
    }

    if (selectedSort === "title") {
      return a.Title.localeCompare(b.Title)
    }

    return 0

  })

  renderMovies(filtered)

}


// add or remove from watchlist
function toggleWatchlist(imdbID) {

  const movie = allMovies.find(m => m.imdbID === imdbID)
  const exists = watchlist.some(w => w.imdbID === imdbID)

  if (exists) {
    // remove using filter() HOF
    watchlist = watchlist.filter(w => w.imdbID !== imdbID)
  } else {
    if (movie) {
      watchlist.push(movie)
    }
  }

  localStorage.setItem("watchlist", JSON.stringify(watchlist))

  renderMovies(allMovies)
  renderWatchlist()

}


// add or remove from favourites
function toggleFav(imdbID) {

  const movie = allMovies.find(m => m.imdbID === imdbID)
  const exists = favorites.some(f => f.imdbID === imdbID)

  if (exists) {
    favorites = favorites.filter(f => f.imdbID !== imdbID)
  } else {
    if (movie) {
      favorites.push(movie)
    }
  }

  localStorage.setItem("favorites", JSON.stringify(favorites))

  renderMovies(allMovies)
  renderFavorites()

}


// show watchlist section
function renderWatchlist() {

  watchlistGrid.innerHTML = ""

  if (!watchlist.length) {
    emptyMsg.style.display = "block"
    return
  }

  emptyMsg.style.display = "none"

  watchlist.forEach(movie => {

    const card = document.createElement("div")
    card.className = "movie-card"

    let poster = ""

    if (movie.Poster && movie.Poster !== "N/A") {
      poster = `<img src="${movie.Poster}" alt="${movie.Title}" />`
    } else {
      poster = `<div class="no-poster">🎬</div>`
    }

    card.innerHTML = `
      ${poster}
      <div class="card-body">
        <div class="card-title">${movie.Title}</div>
        <div class="card-meta">⭐ ${movie.imdbRating || "N/A"} &nbsp;|&nbsp; ${movie.Year}</div>
        <div class="card-btns">
          <button class="btn-add" onclick="toggleWatchlist('${movie.imdbID}')">
            ❌ Remove
          </button>
          <button class="btn-imdb" onclick="openIMDb('${movie.imdbID}')">
            🎬 IMDb
          </button>
        </div>
      </div>
    `

    watchlistGrid.appendChild(card)

  })

}


// open imdb link
function openIMDb(imdbID) {
  const url = `https://www.imdb.com/title/${imdbID}`
  window.open(url, "_blank")
}


// dark and light mode
themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("light")

  if (document.body.classList.contains("light")) {
    themeBtn.textContent = "🌙 Dark Mode"
  } else {
    themeBtn.textContent = "☀️ Light Mode"
  }

})


// search button
searchBtn.addEventListener("click", () => {

  const q = searchInput.value.trim()

  if (!q) return

  fetchMovies(q)

})


// enter key search
searchInput.addEventListener("keydown", e => {

  if (e.key === "Enter") {

    const q = searchInput.value.trim()

    if (!q) return

    fetchMovies(q)

  }

})


// filter dropdown
genreFilter.addEventListener("change", applyFilter)


// sort dropdown
sortBy.addEventListener("change", applyFilter)


// load watchlist on start
renderWatchlist()
renderFavorites()


// show favourites section
function renderFavorites() {

  const favGrid = document.getElementById("favorites-grid")
  const emptyFav = document.getElementById("empty-fav")

  favGrid.innerHTML = ""

  if (!favorites.length) {
    emptyFav.style.display = "block"
    return
  }

  emptyFav.style.display = "none"

  favorites.forEach(movie => {

    const card = document.createElement("div")
    card.className = "movie-card"

    let poster = ""

    if (movie.Poster && movie.Poster !== "N/A") {
      poster = `<img src="${movie.Poster}" alt="${movie.Title}" />`
    } else {
      poster = `<div class="no-poster">🎬</div>`
    }

    card.innerHTML = `
      ${poster}
      <div class="card-body">
        <div class="card-title">${movie.Title}</div>
        <div class="card-meta">⭐ ${movie.imdbRating || "N/A"} &nbsp;|&nbsp; ${movie.Year}</div>
        <div class="card-btns">
          <button class="btn-fav" onclick="toggleFav('${movie.imdbID}')">
            💛 Unfavourite
          </button>
          <button class="btn-imdb" onclick="openIMDb('${movie.imdbID}')">
            🎬 IMDb
          </button>
        </div>
      </div>
    `

    favGrid.appendChild(card)

  })

}