const API_KEY = "1bb9bf58"
const BASE_URL = "https://www.omdbapi.com/"


// movie list and saved data
let allMovies = []
let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]")
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
let watched   = JSON.parse(localStorage.getItem("watched")   || "[]")

// comparison mode
let compareList = []


// page elements
let searchInput  = document.getElementById("search-input")
let searchBtn    = document.getElementById("search-btn")
let moviesGrid   = document.getElementById("movies-grid")
let watchlistGrid = document.getElementById("watchlist-grid")
let loadingEl    = document.getElementById("loading")
let emptyMsg     = document.getElementById("empty-msg")
let resultsTitle = document.getElementById("results-title")
let genreFilter  = document.getElementById("genre-filter")
let sortBy       = document.getElementById("sort-by")
let langFilter   = document.getElementById("lang-filter")
let themeBtn     = document.getElementById("theme-btn")


// =====================
//   HERO SLIDER
// =====================

// popular sequels / trending movies for the slider
const sliderMovies = [
  { id: "tt1877830", badge: "sequel",   badgeText: "Now in Theatres" },
  { id: "tt9114286", badge: "sequel",   badgeText: "Fan Favourite" },
  { id: "tt10298810", badge: "trending", badgeText: "Now Trending" },
  { id: "tt6718170", badge: "kcinema",  badgeText: "K-Cinema" },
  { id: "tt6751668", badge: "kcinema",  badgeText: "K-Cinema" },
  { id: "tt8579674", badge: "latest",   badgeText: "Latest Hit" },
  { id: "tt2096673", badge: "hindi",    badgeText: "Hindi Hit" },
]

let sliderData   = []
let currentSlide = 0
let sliderTimer  = null

async function loadSlider() {

  const requests = sliderMovies.map(item =>
    fetch(`${BASE_URL}?i=${item.id}&apikey=${API_KEY}`)
      .then(r => r.json())
      .then(data => ({ ...data, badge: item.badge, badgeText: item.badgeText }))
  )

  sliderData = await Promise.all(requests)
  sliderData = sliderData.filter(m => m.Response !== "False")

  buildSlider()
  startAutoPlay()

}

function buildSlider() {

  const track      = document.getElementById("slider-track")
  const dotsEl     = document.getElementById("slider-dots")
  const thumbsEl   = document.getElementById("slider-thumbnails")

  track.innerHTML  = ""
  dotsEl.innerHTML = ""
  thumbsEl.innerHTML = ""

  sliderData.forEach((movie, i) => {

    const posterUrl = movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : "https://via.placeholder.com/400x600?text=No+Poster"

    // slide
    const slide = document.createElement("div")
    slide.className = "slide"

    slide.innerHTML = `
      <img class="slide-bg" src="${posterUrl}" alt="${movie.Title}" />
      <div class="slide-info">
        <span class="slide-badge badge-${movie.badge}">${movie.badgeText}</span>
        <div class="slide-title">${movie.Title}</div>
        <div class="slide-meta">⭐ ${movie.imdbRating || "N/A"} &nbsp;|&nbsp; ${movie.Year} &nbsp;|&nbsp; ${movie.Genre ? movie.Genre.split(",")[0] : "N/A"} &nbsp;|&nbsp; ${movie.Runtime || "N/A"}</div>
        <div class="slide-btns">
          <button class="btn-play" onclick="openIMDb('${movie.imdbID}')">▶ Watch on IMDb</button>
          <button class="btn-info" onclick="addToWatchlistFromSlider('${movie.imdbID}')">+ Watchlist</button>
        </div>
      </div>
    `

    track.appendChild(slide)

    // dot
    const dot = document.createElement("div")
    dot.className = i === 0 ? "dot active" : "dot"
    dot.onclick = () => goToSlide(i)
    dotsEl.appendChild(dot)

    // thumbnail
    const thumb = document.createElement("img")
    thumb.className = i === 0 ? "thumb active" : "thumb"
    thumb.src = posterUrl
    thumb.alt = movie.Title
    thumb.onclick = () => goToSlide(i)
    thumbsEl.appendChild(thumb)

  })

}

function goToSlide(n) {

  currentSlide = n

  const track  = document.getElementById("slider-track")
  const dots   = document.querySelectorAll(".dot")
  const thumbs = document.querySelectorAll(".thumb")

  track.style.transform = `translateX(-${currentSlide * 100}%)`

  dots.forEach((d, i)   => d.classList.toggle("active", i === currentSlide))
  thumbs.forEach((t, i) => t.classList.toggle("active", i === currentSlide))

}

function startAutoPlay() {
  sliderTimer = setInterval(() => {
    const next = (currentSlide + 1) % sliderData.length
    goToSlide(next)
  }, 3500)
}

function stopAutoPlay() {
  clearInterval(sliderTimer)
}

document.getElementById("prev-slide").addEventListener("click", () => {
  stopAutoPlay()
  const prev = (currentSlide - 1 + sliderData.length) % sliderData.length
  goToSlide(prev)
  startAutoPlay()
})

document.getElementById("next-slide").addEventListener("click", () => {
  stopAutoPlay()
  const next = (currentSlide + 1) % sliderData.length
  goToSlide(next)
  startAutoPlay()
})

function addToWatchlistFromSlider(imdbID) {

  const movie = sliderData.find(m => m.imdbID === imdbID)
  const already = watchlist.some(w => w.imdbID === imdbID)

  if (!already && movie) {
    watchlist.push(movie)
    localStorage.setItem("watchlist", JSON.stringify(watchlist))
    renderWatchlist()
    alert(`✅ "${movie.Title}" added to your watchlist!`)
  } else {
    alert("Already in your watchlist!")
  }

}


// =====================
//   FETCH MOVIES
// =====================

async function fetchMovies(query) {

  loadingEl.classList.remove("hidden")
  moviesGrid.innerHTML = ""
  resultsTitle.textContent = `Results for "${query}"`

  try {

    const url = `${BASE_URL}?s=${query}&type=movie&apikey=${API_KEY}`
    const res  = await fetch(url)
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


// =====================
//   RENDER MOVIES
// =====================

function renderMovies(list) {

  moviesGrid.innerHTML = ""

  if (!list || list.length === 0) {
    moviesGrid.innerHTML = `<p style="color:#aaa;">No movies to show.</p>`
    return
  }

  list.forEach(movie => {

    const inWatchlist  = watchlist.some(w  => w.imdbID  === movie.imdbID)
    const isFav        = favorites.some(f  => f.imdbID  === movie.imdbID)
    const isWatched    = watched.some(ww   => ww.imdbID === movie.imdbID)
    const inCompare    = compareList.some(c => c.imdbID === movie.imdbID)

    const card = document.createElement("div")
    card.className = "movie-card"

    let poster = ""

    if (movie.Poster && movie.Poster !== "N/A") {
      poster = `<img src="${movie.Poster}" alt="${movie.Title}" />`
    } else {
      poster = `<div class="no-poster">🎬</div>`
    }

    const watchedBadge = isWatched
      ? `<div class="card-watched-badge">✅ Watched</div>`
      : ""

    card.innerHTML = `
      ${poster}
      ${watchedBadge}
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
          <button class="btn-watched" onclick="toggleWatched('${movie.imdbID}')">
            ${isWatched ? "↩️ Unwatch" : "✅ Watched"}
          </button>
          <button class="btn-compare" onclick="addToCompare('${movie.imdbID}')">
            ${inCompare ? "✔ In Compare" : "⚔️ Compare"}
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


// =====================
//   FILTER & SORT
// =====================

function applyFilter() {

  const selectedGenre = genreFilter.value
  const selectedSort  = sortBy.value
  const selectedLang  = langFilter.value

  // filter() HOF — genre filter
  let filtered = allMovies.filter(movie => {
    if (!selectedGenre) return true
    return movie.Genre && movie.Genre.includes(selectedGenre)
  })

  // filter() HOF — language filter
  filtered = filtered.filter(movie => {
    if (!selectedLang) return true
    return movie.Language && movie.Language.includes(selectedLang)
  })

  // sort() HOF
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


// =====================
//   WATCHLIST
// =====================

function toggleWatchlist(imdbID) {

  // saare possible sources combine karo
  const allSources = [...allMovies, ...sliderData, ...watchlist, ...favorites, ...watched]

  // movie dhundo
  const movie = allSources.find(m => m.imdbID === imdbID)

  const exists = watchlist.some(w => w.imdbID === imdbID)

  if (exists) {
    watchlist = watchlist.filter(w => w.imdbID !== imdbID)
  } else {
  if (!exists && movie) {
    watchlist.push(movie)
  } else {
      alert("Something went wrong. Movie not found.")
      return
    }
  }

  localStorage.setItem("watchlist", JSON.stringify(watchlist))

if (allMovies.length) renderMovies(allMovies)
  renderWatchlist()
}

async function renderWatchlist() {

  watchlistGrid.innerHTML = ""

  if (!watchlist.length) {
    emptyMsg.style.display = "block"
    return
  }

  emptyMsg.style.display = "none"

  try {

    // saare fetch ek saath
    const requests = watchlist.map(item =>
      fetch(`${BASE_URL}?i=${item.imdbID}&apikey=${API_KEY}`)
        .then(res => res.json())
    )

    const movies = await Promise.all(requests)

    movies.forEach(movie => {

      const card = document.createElement("div")
      card.className = "movie-card"

      let poster = movie.Poster && movie.Poster !== "N/A"
        ? `<img src="${movie.Poster}" alt="${movie.Title}" />`
        : `<div class="no-poster">🎬</div>`

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

  } catch (err) {
    watchlistGrid.innerHTML = `<p style="color:#aaa;">Error loading watchlist.</p>`
  }

}


// =====================
//   FAVOURITES
// =====================

function toggleFav(imdbID) {

  const movie  = allMovies.find(m => m.imdbID === imdbID)
  const exists = favorites.some(f => f.imdbID === imdbID)

  if (exists) {
    favorites = favorites.filter(f => f.imdbID !== imdbID)
  } else {
    if (movie) favorites.push(movie)
  }

  localStorage.setItem("favorites", JSON.stringify(favorites))

  if (allMovies.length) renderMovies(allMovies)
  renderFavorites()

}

function renderFavorites() {

  const favGrid  = document.getElementById("favorites-grid")
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


// =====================
//   ALREADY WATCHED
// =====================

function toggleWatched(imdbID) {

  const movie  = allMovies.find(m => m.imdbID === imdbID)
  const exists = watched.some(ww => ww.imdbID === imdbID)

  if (exists) {
    watched = watched.filter(ww => ww.imdbID !== imdbID)
  } else {
    if (movie) watched.push(movie)
  }

  localStorage.setItem("watched", JSON.stringify(watched))

  if (allMovies.length) renderMovies(allMovies)
  renderWatched()

}

function renderWatched() {

  const watchedGrid    = document.getElementById("watched-grid")
  const emptyWatched   = document.getElementById("empty-watched")

  watchedGrid.innerHTML = ""

  if (!watched.length) {
    emptyWatched.style.display = "block"
    return
  }

  emptyWatched.style.display = "none"

  watched.forEach(movie => {

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
      <div class="card-watched-badge">✅ Watched</div>
      <div class="card-body">
        <div class="card-title">${movie.Title}</div>
        <div class="card-meta">⭐ ${movie.imdbRating || "N/A"} &nbsp;|&nbsp; ${movie.Year}</div>
        <div class="card-btns">
          <button class="btn-watched" onclick="toggleWatched('${movie.imdbID}')">
            ↩️ Unwatch
          </button>
          <button class="btn-imdb" onclick="openIMDb('${movie.imdbID}')">
            🎬 IMDb
          </button>
        </div>
      </div>
    `

    watchedGrid.appendChild(card)

  })

}


// =====================
//   RANDOM MOVIE NIGHT
// =====================

function randomMovieNight() {

  if (!watchlist.length) {
    alert("Add some movies to your watchlist first! 🎬")
    return
  }

  const pick = watchlist[Math.floor(Math.random() * watchlist.length)]
  alert(`🎲 Tonight, watch:\n\n"${pick.Title}" (${pick.Year})\n⭐ ${pick.imdbRating || "N/A"} &nbsp;|&nbsp; ${pick.Genre || "N/A"}`)

}


// =====================
//   COMPARE MODE
// =====================

function addToCompare(imdbID) {

  const movie   = allMovies.find(m => m.imdbID === imdbID)
  const already = compareList.some(c => c.imdbID === imdbID)

  if (already) {
    // remove it
    compareList = compareList.filter(c => c.imdbID !== imdbID)
  } else {

    if (compareList.length >= 2) {
      alert("You can only compare 2 movies at a time. Remove one first.")
      return
    }

    if (movie) compareList.push(movie)

  }

  updateCompareSlots()
  renderMovies(allMovies)

}

function updateCompareSlots() {

  const slot1  = document.getElementById("compare-slot-1")
  const slot2  = document.getElementById("compare-slot-2")
  const goBtn  = document.getElementById("do-compare-btn")

  // slot 1
  if (compareList[0]) {
    const m = compareList[0]
    const posterSrc = m.Poster && m.Poster !== "N/A" ? m.Poster : ""
    slot1.className = "compare-slot filled"
    slot1.innerHTML = posterSrc
      ? `<img src="${posterSrc}" alt="${m.Title}" /><span class="slot-title">${m.Title}</span>`
      : `<span class="slot-title">${m.Title}</span>`
  } else {
    slot1.className = "compare-slot"
    slot1.innerHTML = `<p>Pick Movie 1</p>`
  }

  // slot 2
  if (compareList[1]) {
    const m = compareList[1]
    const posterSrc = m.Poster && m.Poster !== "N/A" ? m.Poster : ""
    slot2.className = "compare-slot filled"
    slot2.innerHTML = posterSrc
      ? `<img src="${posterSrc}" alt="${m.Title}" /><span class="slot-title">${m.Title}</span>`
      : `<span class="slot-title">${m.Title}</span>`
  } else {
    slot2.className = "compare-slot"
    slot2.innerHTML = `<p>Pick Movie 2</p>`
  }

  // show compare button only when both slots filled
  if (compareList.length === 2) {
    goBtn.classList.remove("hidden")
  } else {
    goBtn.classList.add("hidden")
  }

}

document.getElementById("do-compare-btn").addEventListener("click", () => {

  if (compareList.length < 2) return

  const a = compareList[0]
  const b = compareList[1]

  const ratingA  = parseFloat(a.imdbRating) || 0
  const ratingB  = parseFloat(b.imdbRating) || 0
  const yearA    = parseInt(a.Year) || 0
  const yearB    = parseInt(b.Year) || 0

  const ratingWinner = ratingA > ratingB ? "a" : ratingB > ratingA ? "b" : "tie"
  const yearWinner   = yearA   > yearB   ? "a" : yearB   > yearA   ? "b" : "tie"

  const winBadge = `<span class="winner-badge">👑 Winner</span>`

  const modal   = document.getElementById("compare-modal")
  const content = document.getElementById("modal-content")

  content.innerHTML = `
    <h2 style="margin-bottom: 16px; color: #e94560;">⚔️ Head to Head</h2>
    <table class="compare-table">
      <thead>
        <tr>
          <th>Category</th>
          <th>${a.Title}</th>
          <th>${b.Title}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>⭐ Rating</td>
          <td>${a.imdbRating || "N/A"} ${ratingWinner === "a" ? winBadge : ""}</td>
          <td>${b.imdbRating || "N/A"} ${ratingWinner === "b" ? winBadge : ""}</td>
        </tr>
        <tr>
          <td>📅 Year</td>
          <td>${a.Year} ${yearWinner === "a" ? winBadge : ""}</td>
          <td>${b.Year} ${yearWinner === "b" ? winBadge : ""}</td>
        </tr>
        <tr>
          <td>⏱ Runtime</td>
          <td>${a.Runtime || "N/A"}</td>
          <td>${b.Runtime || "N/A"}</td>
        </tr>
        <tr>
          <td>🎭 Genre</td>
          <td>${a.Genre || "N/A"}</td>
          <td>${b.Genre || "N/A"}</td>
        </tr>
        <tr>
          <td>🌍 Language</td>
          <td>${a.Language || "N/A"}</td>
          <td>${b.Language || "N/A"}</td>
        </tr>
        <tr>
          <td>🎬 Director</td>
          <td>${a.Director || "N/A"}</td>
          <td>${b.Director || "N/A"}</td>
        </tr>
        <tr>
          <td>🏆 Awards</td>
          <td>${a.Awards || "N/A"}</td>
          <td>${b.Awards || "N/A"}</td>
        </tr>
      </tbody>
    </table>
  `

  modal.classList.remove("hidden")

})

function closeCompareModal() {
  document.getElementById("compare-modal").classList.add("hidden")
}

document.getElementById("compare-modal").addEventListener("click", (e) => {
  if (e.target.id === "compare-modal") closeCompareModal()
})


// =====================
//   MOOD SUGGESTIONS
// =====================

const moodMap = {
  happy     : "Comedy",
  sad       : "Drama",
  scared    : "Horror",
  romantic  : "Romance",
  thriller  : "Thriller",
  adventure : "Adventure",
}

async function fetchMoodMovies(mood) {

  const moodLoadingEl = document.getElementById("mood-loading")
  const moodGrid      = document.getElementById("mood-grid")

  moodGrid.innerHTML = ""
  moodLoadingEl.classList.remove("hidden")

  // highlight active mood btn
  document.querySelectorAll(".mood-btn").forEach(btn => btn.classList.remove("active"))
  event.target.classList.add("active")

  const genre = moodMap[mood] || "Comedy"

  try {

    const res  = await fetch(`${BASE_URL}?s=${genre}&type=movie&apikey=${API_KEY}`)
    const data = await res.json()

    moodLoadingEl.classList.add("hidden")

    if (data.Response === "False" || !data.Search) {
      moodGrid.innerHTML = `<p style="color:#aaa;">No movies found for this mood.</p>`
      return
    }

    const requests = data.Search.slice(0, 6).map(m =>
      fetch(`${BASE_URL}?i=${m.imdbID}&apikey=${API_KEY}`).then(r => r.json())
    )

    const movies = await Promise.all(requests)

    moodGrid.innerHTML = ""

    movies.forEach(movie => {

      const card = document.createElement("div")
      card.className = "movie-card"

      let poster = movie.Poster && movie.Poster !== "N/A"
        ? `<img src="${movie.Poster}" alt="${movie.Title}" />`
        : `<div class="no-poster">🎬</div>`

      card.innerHTML = `
        ${poster}
        <div class="card-body">
          <div class="card-title">${movie.Title}</div>
          <div class="card-meta">⭐ ${movie.imdbRating || "N/A"} &nbsp;|&nbsp; ${movie.Year}</div>
          <div class="card-btns">
            <button class="btn-add" onclick="quickAddWatchlist('${movie.imdbID}', this)">➕ Watchlist</button>
            <button class="btn-imdb" onclick="openIMDb('${movie.imdbID}')">🎬 IMDb</button>
          </div>
        </div>
      `

      moodGrid.appendChild(card)

    })

  } catch (err) {

    moodLoadingEl.classList.add("hidden")
    moodGrid.innerHTML = `<p style="color:#aaa;">Something went wrong.</p>`

  }

}

// helper to add to watchlist from sections outside main search
function quickAddWatchlist(imdbID, btnEl) {

  // check all possible sources
  const allSources = [...allMovies, ...sliderData]
  let movie = allSources.find(m => m.imdbID === imdbID)

  const already = watchlist.some(w => w.imdbID === imdbID)

  if (already) {
    alert("Already in watchlist!")
    return
  }

  if (movie) {
    watchlist.push({ imdbID: movie.imdbID })
    localStorage.setItem("watchlist", JSON.stringify(watchlist))
    renderWatchlist()
    btnEl.textContent = "✅ Added!"
    btnEl.disabled = true
  }

}


// =====================
//   LANGUAGE FILTER
// =====================

async function fetchLangMovies(lang) {

  const moviesToSearch = {
    Hindi    : "Bahubali",
    English  : "Avengers",
    Korean   : "Parasite",
    Japanese : "Spirited",
    Spanish  : "Roma",
  }

  const query = moviesToSearch[lang] || lang

  // scroll to search results
  document.getElementById("results-title").textContent = `${lang} Movies`
  document.getElementById("movies-grid").innerHTML = ""
  loadingEl.classList.remove("hidden")

  try {

    const res  = await fetch(`${BASE_URL}?s=${query}&type=movie&apikey=${API_KEY}`)
    const data = await res.json()

    loadingEl.classList.add("hidden")

    if (data.Response === "False") {
      document.getElementById("movies-grid").innerHTML = `<p style="color:#aaa;">No results found.</p>`
      return
    }

    const requests = data.Search.map(m =>
      fetch(`${BASE_URL}?i=${m.imdbID}&apikey=${API_KEY}`).then(r => r.json())
    )

    allMovies = await Promise.all(requests)

    // filter() HOF — keep only movies with matching language
    const langFiltered = allMovies.filter(m =>
      m.Language && m.Language.includes(lang)
    )

    renderMovies(langFiltered.length ? langFiltered : allMovies)

    // scroll to results
    document.querySelector(".results").scrollIntoView({ behavior: "smooth" })

  } catch (err) {
    loadingEl.classList.add("hidden")
    document.getElementById("movies-grid").innerHTML = `<p style="color:#aaa;">Something went wrong.</p>`
  }

}


// =====================
//   TOP 10 GENRE SECTIONS
// =====================

const top10Queries = {
  Comedy   : "funny comedy",
  Horror   : "horror scary",
  Action   : "action hero",
  Romance  : "love romance",
  Thriller : "thriller suspense",
}

let activeGenreTab = "Comedy"

async function switchGenreTab(genre, btnEl) {

  document.querySelectorAll(".genre-tab").forEach(b => b.classList.remove("active"))
  btnEl.classList.add("active")

  activeGenreTab = genre
  await fetchTop10(genre)

}

async function fetchTop10(genre) {

  const genreLoading = document.getElementById("genre-loading")
  const genreGrid    = document.getElementById("genre-grid")

  genreGrid.innerHTML = ""
  genreLoading.classList.remove("hidden")

  const query = top10Queries[genre] || genre

  try {

    const res  = await fetch(`${BASE_URL}?s=${query}&type=movie&apikey=${API_KEY}`)
    const data = await res.json()

    genreLoading.classList.add("hidden")

    if (data.Response === "False" || !data.Search) {
      genreGrid.innerHTML = `<p style="color:#aaa;">No results found.</p>`
      return
    }

    const top10 = data.Search.slice(0, 10)

    const requests = top10.map(m =>
      fetch(`${BASE_URL}?i=${m.imdbID}&apikey=${API_KEY}`).then(r => r.json())
    )

    const movies = await Promise.all(requests)

    // sort by rating using sort() HOF
    const sorted = movies.sort((a, b) =>
      parseFloat(b.imdbRating || 0) - parseFloat(a.imdbRating || 0)
    )

    genreGrid.innerHTML = ""

    sorted.forEach((movie, idx) => {

      const card = document.createElement("div")
      card.className = "movie-card"

      let poster = movie.Poster && movie.Poster !== "N/A"
        ? `<img src="${movie.Poster}" alt="${movie.Title}" />`
        : `<div class="no-poster">🎬</div>`

      card.innerHTML = `
        ${poster}
        <div class="card-body">
          <div class="card-meta" style="color:#e94560; font-weight:700; margin-bottom:3px;">#${idx + 1}</div>
          <div class="card-title">${movie.Title}</div>
          <div class="card-meta">⭐ ${movie.imdbRating || "N/A"} &nbsp;|&nbsp; ${movie.Year}</div>
          <div class="card-btns">
            <button class="btn-add" onclick="quickAddWatchlist('${movie.imdbID}', this)">➕ Watchlist</button>
            <button class="btn-imdb" onclick="openIMDb('${movie.imdbID}')">🎬 IMDb</button>
          </div>
        </div>
      `

      genreGrid.appendChild(card)

    })

  } catch (err) {
    genreLoading.classList.add("hidden")
    genreGrid.innerHTML = `<p style="color:#aaa;">Something went wrong.</p>`
  }

}


// =====================
//   LATEST RELEASES
// =====================

async function fetchLatest() {

  const latestLoading = document.getElementById("latest-loading")
  const latestGrid    = document.getElementById("latest-grid")

  latestLoading.classList.remove("hidden")

  try {

    const res  = await fetch(`${BASE_URL}?s=2024&type=movie&y=2024&apikey=${API_KEY}`)
    const data = await res.json()

    latestLoading.classList.add("hidden")

    if (data.Response === "False" || !data.Search) {
      latestGrid.innerHTML = `<p style="color:#aaa;">No latest movies found.</p>`
      return
    }

    const requests = data.Search.slice(0, 8).map(m =>
      fetch(`${BASE_URL}?i=${m.imdbID}&apikey=${API_KEY}`).then(r => r.json())
    )

    const movies = await Promise.all(requests)

    // sort by year desc using sort() HOF
    const sorted = movies.sort((a, b) => parseInt(b.Year || 0) - parseInt(a.Year || 0))

    sorted.forEach(movie => {

      const card = document.createElement("div")
      card.className = "movie-card"

      let poster = movie.Poster && movie.Poster !== "N/A"
        ? `<img src="${movie.Poster}" alt="${movie.Title}" />`
        : `<div class="no-poster">🎬</div>`

      card.innerHTML = `
        ${poster}
        <div class="card-body">
          <div class="card-title">${movie.Title}</div>
          <div class="card-meta">⭐ ${movie.imdbRating || "N/A"} &nbsp;|&nbsp; ${movie.Year} &nbsp;|&nbsp; ${movie.Genre ? movie.Genre.split(",")[0] : "N/A"}</div>
          <div class="card-btns">
            <button class="btn-add" onclick="quickAddWatchlist('${movie.imdbID}', this)">➕ Watchlist</button>
            <button class="btn-imdb" onclick="openIMDb('${movie.imdbID}')">🎬 IMDb</button>
          </div>
        </div>
      `

      latestGrid.appendChild(card)

    })

  } catch (err) {
    latestLoading.classList.add("hidden")
    latestGrid.innerHTML = `<p style="color:#aaa;">Something went wrong.</p>`
  }

}


// =====================
//   OPEN IMDB
// =====================

function openIMDb(imdbID) {
  const url = `https://www.imdb.com/title/${imdbID}`
  window.open(url, "_blank")
}


// =====================
//   DARK / LIGHT MODE
// =====================

themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("light")

  if (document.body.classList.contains("light")) {
    themeBtn.textContent = "🌙 Dark Mode"
  } else {
    themeBtn.textContent = "☀️ Light Mode"
  }

  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark")

})

// remember theme on reload
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light")
  themeBtn.textContent = "🌙 Dark Mode"
}


// =====================
//   SEARCH EVENTS
// =====================

searchBtn.addEventListener("click", () => {

  const q = searchInput.value.trim()
  if (!q) return
  fetchMovies(q)

})

searchInput.addEventListener("keydown", e => {

  if (e.key === "Enter") {
    const q = searchInput.value.trim()
    if (!q) return
    fetchMovies(q)
  }

})


// filter dropdowns
genreFilter.addEventListener("change", applyFilter)
sortBy.addEventListener("change", applyFilter)
langFilter.addEventListener("change", applyFilter)


// =====================
//   INIT ON PAGE LOAD
// =====================

renderWatchlist()
renderFavorites()
renderWatched()
loadSlider()
fetchTop10("Comedy")
fetchLatest()