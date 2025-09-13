const API_KEY = "e76bf5"; // OMDB API key

// DOM Elements
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const movieList = document.getElementById("movieList");
const favoritesBtn = document.getElementById("favoritesBtn");
const favoritesSection = document.getElementById("favoritesSection");
const favoritesList = document.getElementById("favoritesList");
const themeToggle = document.getElementById("themeToggle");
const sortSelect = document.getElementById("sortSelect");
const pagination = document.getElementById("pagination");

// Modal elements
const movieModal = document.getElementById("movieModal");
const closeModal = document.getElementById("closeModal");
const modalDetails = document.getElementById("modalDetails");

// Data
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let movies = [];
let currentPage = 1;
const moviesPerPage = 6;

// ====== SEARCH MOVIES ======
async function searchMovies() {
  const query = searchInput.value.trim();
  if (!query) return alert("Please enter a movie name!");

  const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&type=movie`);
  const data = await res.json();

  movies = data.Search || [];
  currentPage = 1;
  renderMovies();
}

// ====== RENDER MOVIES ======
function renderMovies() {
  movieList.innerHTML = "";

  let sortedMovies = [...movies];
  const sortOption = sortSelect.value;

  if (sortOption === "yearAsc") sortedMovies.sort((a, b) => a.Year.localeCompare(b.Year));
  else if (sortOption === "yearDesc") sortedMovies.sort((a, b) => b.Year.localeCompare(a.Year));
  else if (sortOption === "titleAsc") sortedMovies.sort((a, b) => a.Title.localeCompare(b.Title));
  else if (sortOption === "titleDesc") sortedMovies.sort((a, b) => b.Title.localeCompare(a.Title));

  // Pagination
  const start = (currentPage - 1) * moviesPerPage;
  const end = start + moviesPerPage;
  const paginatedMovies = sortedMovies.slice(start, end);

  if (paginatedMovies.length === 0) {
    movieList.innerHTML = "<p>No movies found.</p>";
    pagination.innerHTML = "";
    return;
  }

  paginatedMovies.forEach(movie => {
    const div = document.createElement("div");
    div.classList.add("movie");

    div.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/200"}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <p>Year: ${movie.Year}</p>
      <button onclick="addToFavorites('${movie.imdbID}', '${movie.Title}', '${movie.Poster}')">⭐ Add to Watchlist</button>
    `;

    div.addEventListener("click", () => showMovieDetails(movie.imdbID)); // open modal
    movieList.appendChild(div);
  });

  renderPagination(sortedMovies.length);
}

// ====== PAGINATION ======
function renderPagination(totalMovies) {
  pagination.innerHTML = "";
  const totalPages = Math.ceil(totalMovies / moviesPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.classList.add("page-btn");
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentPage = i;
      renderMovies();
    });

    pagination.appendChild(btn);
  }
}

// ====== MOVIE DETAILS (MODAL) ======
async function showMovieDetails(movieID) {
  const url = `https://www.omdbapi.com/?i=${movieID}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const movie = await res.json();

  modalDetails.innerHTML = `
    <h2>${movie.Title} (${movie.Year})</h2>
    <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200'}" alt="${movie.Title}" style="width:100%; border-radius:8px;">
    <p><strong>Genre:</strong> ${movie.Genre}</p>
    <p><strong>Director:</strong> ${movie.Director}</p>
    <p><strong>Actors:</strong> ${movie.Actors}</p>
    <p><strong>IMDb Rating:</strong> ⭐ ${movie.imdbRating}</p>
    <p><strong>Plot:</strong> ${movie.Plot}</p>
  `;

  movieModal.style.display = "flex";
}

// ====== FAVORITES ======
function addToFavorites(id, title, poster) {
  if (!favorites.some(movie => movie.id === id)) {
    favorites.push({ id, title, poster });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert("Added to Watchlist! ⭐");
    displayFavorites();
  } else {
    alert("Already in Watchlist! 😉");
  }
}

function displayFavorites() {
  favoritesList.innerHTML = "";
  if (favorites.length === 0) {
    favoritesList.innerHTML = "<p>No favorites yet.</p>";
    return;
  }

  favorites.forEach(movie => {
    const div = document.createElement("div");
    div.classList.add("movie");
    div.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <button onclick="removeFromFavorites('${movie.id}')">❌ Remove</button>
    `;
    favoritesList.appendChild(div);
  });
}

function removeFromFavorites(id) {
  favorites = favorites.filter(movie => movie.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
}

// ====== THEME TOGGLE ======
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

// ====== MODAL CLOSE ======
closeModal.onclick = () => (movieModal.style.display = "none");
window.onclick = (e) => {
  if (e.target === movieModal) movieModal.style.display = "none";
};

// ====== EVENT LISTENERS ======
searchBtn.addEventListener("click", searchMovies);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMovies();
});
favoritesBtn.addEventListener("click", () => {
  favoritesSection.classList.toggle("hidden");
  displayFavorites();
});
sortSelect.addEventListener("change", renderMovies);
