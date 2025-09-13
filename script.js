const API_KEY = "e76bf5"; // your OMDB API key
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const movieList = document.getElementById("movie-list");
const favoritesList = document.getElementById("favorites-list");

// Modal elements
const movieModal = document.getElementById("movieModal");
const closeModal = document.getElementById("closeModal");
const modalDetails = document.getElementById("modalDetails");

// Load favorites from localStorage
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
renderFavorites();

// Search movies
async function searchMovies() {
  const query = searchInput.value.trim();
  if (!query) return alert("Please enter a movie name!");

  const url = `https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  movieList.innerHTML = "";

  if (data.Response === "True") {
    data.Search.forEach(movie => {
      const movieCard = document.createElement("div");
      movieCard.classList.add("movie-card");
      movieCard.innerHTML = `
        <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200'}" alt="${movie.Title}">
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
        <button class="fav-btn">Add to Favorites</button>
      `;

      movieCard.querySelector(".fav-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        addToFavorites(movie);
      });

      movieCard.addEventListener("click", () => showMovieDetails(movie.imdbID));
      movieList.appendChild(movieCard);
    });
  } else {
    movieList.innerHTML = `<p>No results found for "${query}"</p>`;
  }
}

// Show movie details in modal
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

// Favorites functions
function addToFavorites(movie) {
  if (!favorites.some(fav => fav.imdbID === movie.imdbID)) {
    favorites.push(movie);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
  } else {
    alert("Already in favorites!");
  }
}

function removeFromFavorites(id) {
  favorites = favorites.filter(movie => movie.imdbID !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  favoritesList.innerHTML = "";
  if (favorites.length === 0) {
    favoritesList.innerHTML = "<p>No favorites added yet.</p>";
    return;
  }

  favorites.forEach(movie => {
    const favItem = document.createElement("div");
    favItem.classList.add("favorite-item");
    favItem.innerHTML = `
      <span>${movie.Title} (${movie.Year})</span>
      <button onclick="removeFromFavorites('${movie.imdbID}')">Remove</button>
    `;
    favoritesList.appendChild(favItem);
  });
}

// Close modal
closeModal.onclick = () => {
  movieModal.style.display = "none";
};

// Close modal if user clicks outside
window.onclick = (event) => {
  if (event.target === movieModal) {
    movieModal.style.display = "none";
  }
};

// Event listeners
searchBtn.addEventListener("click", searchMovies);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMovies();
});
