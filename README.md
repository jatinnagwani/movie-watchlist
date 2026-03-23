# 🎬 Movie Watchlist

Ever spent more time deciding what to watch than actually watching something? Yeah, same. This app fixes that.

Movie Watchlist lets you search for any movie, check its ratings and details, and save it to your personal watchlist so you never lose track of what you want to watch next.

---

## 📌 What is this project?

This is a frontend web application built with vanilla JavaScript. It connects to the OMDb API to fetch real movie data — posters, ratings, genres, release years — and displays it in a clean, easy-to-use interface.

The idea is simple: search for movies, add the ones you like to your watchlist, and come back to them whenever you're ready.

---

## 🌐 API Used

**OMDb API** — [https://www.omdbapi.com/](https://www.omdbapi.com/)

OMDb is a free API that gives you access to a massive database of movies and shows. It returns all the important stuff — title, poster, IMDb rating, genre, plot, and more.

---

## ✨ Features

- 🔍 **Search Movies** — Type a movie name and get live results from OMDb
- ➕ **Watchlist Toggle** — Add or remove movies from your watchlist with one click
- 🎭 **Filter by Genre** — Narrow down results by genre
- 🔢 **Sort by Rating or Year** — Sort movies however you prefer
- 🌙 **Dark / Light Mode** — Switch themes based on your mood
- 📭 **Empty States** — Helpful messages when search returns nothing or your watchlist is empty
- 📱 **Responsive Design** — Works well on phone, tablet, and desktop

---

## 🛠️ Built With

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- OMDb API (via fetch)

---

## 🚀 How to Run This Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/jatinnagwani/movie-watchlist.git
   ```

2. Go into the project folder:
   ```bash
   cd movie-watchlist
   ```

3. Get a free API key from [omdbapi.com](https://www.omdbapi.com/apikey.aspx) and add it to `script.js`:
   ```js
   const API_KEY = "your_api_key_here";
   ```

4. Open `index.html` in your browser and you're good to go.

---

## 📁 Folder Structure

```
movie-watchlist/
├── index.html
├── style.css
├── script.js
└── README.md
```

---

## 🙌 Credits

- Movie data powered by [OMDb API](https://www.omdbapi.com/)
- Built as part of an Individual Graded Project for a Web Development course
