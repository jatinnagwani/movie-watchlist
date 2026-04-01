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

let allMovies = []
let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]")

const searchInput = document.getElementById("search-input")
const searchBtn = document.getElementById("search-btn")
const moviesGrid = document.getElementById("movies-grid")
const watchlistGrid = document.getElementById("watchlist-grid")
const loadingEl = document.getElementById("loading")
const emptyWatchlist = document.getElementById("empty-watchlist")
const sectionTitle = document.getElementById("section-title")

async function fetchMovies(query){

  loadingEl.classList.remove("hidden")
  moviesGrid.innerHTML = ""
  sectionTitle.textContent = `Results for "${query}"`

  try{

    const url = `${BASE_URL}?s=${query}&type=movie&apikey=${API_KEY}`
    const res = await fetch(url)
    const data = await res.json()

    loadingEl.classList.add("hidden")

    if(data.Response === "False"){
      moviesGrid.innerHTML = `<p style="color:#aaa;">No results found for "${query}"</p>`
      return
    }

    const detailPromises = []

    data.Search.forEach(movie=>{
      const req = fetch(`${BASE_URL}?i=${movie.imdbID}&apikey=${API_KEY}`)
        .then(r => r.json())
      detailPromises.push(req)
    })

    allMovies = await Promise.all(detailPromises)

    renderMovies(allMovies)

  }catch(err){

    loadingEl.classList.add("hidden")
    moviesGrid.innerHTML = `<p style="color:#aaa;">Something went wrong. Try again.</p>`
  }
}

function renderMovies(movies){

  moviesGrid.innerHTML = ""

  if(!movies || movies.length === 0){
    moviesGrid.innerHTML = `<p style="color:#aaa;">No movies to show.</p>`
    return
  }

  movies.forEach(movie=>{

    const inWatchlist = watchlist.some(w => w.imdbID === movie.imdbID)

    const card = document.createElement("div")
    card.className = "movie-card"

    let posterBlock = ""

    if(movie.Poster && movie.Poster !== "N/A"){
      posterBlock = `<img src="${movie.Poster}" alt="${movie.Title}" />`
    }else{
      posterBlock = `<div class="no-poster">🎬</div>`
    }

    let btnText = "➕ Watchlist"
    if(inWatchlist){
      btnText = "❌ Remove"
    }

    card.innerHTML = `
      ${posterBlock}
      <div class="card-body">
        <div class="card-title">${movie.Title}</div>
        <div class="card-meta">⭐ ${movie.imdbRating || "N/A"} | ${movie.Year}</div>
        <div class="card-btns">
          <button class="btn-add" onclick="toggleWatchlist('${movie.imdbID}')">
            ${btnText}
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

function toggleWatchlist(imdbID){

  const movie = allMovies.find(m => m.imdbID === imdbID)
  const exists = watchlist.some(w => w.imdbID === imdbID)

  if(exists){
    watchlist = watchlist.filter(w => w.imdbID !== imdbID)
  }else{
    if(movie){
      watchlist.push(movie)
    }
  }

  localStorage.setItem("watchlist", JSON.stringify(watchlist))

  renderMovies(allMovies)
  renderWatchlist()
}

function renderWatchlist(){

  watchlistGrid.innerHTML = ""

  if(!watchlist.length){
    emptyWatchlist.style.display = "block"
    return
  }

  emptyWatchlist.style.display = "none"

  watchlist.forEach(movie=>{

    const card = document.createElement("div")
    card.className = "movie-card"

    let posterBlock = ""

    if(movie.Poster && movie.Poster !== "N/A"){
      posterBlock = `<img src="${movie.Poster}" alt="${movie.Title}" />`
    }else{
      posterBlock = `<div class="no-poster">🎬</div>`
    }

    card.innerHTML = `
      ${posterBlock}
      <div class="card-body">
        <div class="card-title">${movie.Title}</div>
        <div class="card-meta">⭐ ${movie.imdbRating || "N/A"} | ${movie.Year}</div>
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

function openIMDb(imdbID){
  const url = `https://www.imdb.com/title/${imdbID}`
  window.open(url, "_blank")
}

searchBtn.addEventListener("click", ()=>{

  const q = searchInput.value.trim()

  if(!q){
    return
  }

  fetchMovies(q)

})

searchInput.addEventListener("keydown", e=>{

  if(e.key === "Enter"){

    const q = searchInput.value.trim()

    if(!q){
      return
    }

    fetchMovies(q)
  }

})

renderWatchlist()