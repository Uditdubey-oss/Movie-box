
const API_KEY = "c490abfb";
const BASE_URL = "https://www.omdbapi.com/";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const moviesContainer = document.getElementById("moviesContainer");
const message = document.getElementById("message");
const sectionTitle = document.getElementById("sectionTitle");

const modal = document.getElementById("movieModal");
const movieDetails = document.getElementById("movieDetails");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function getPoster(poster) {
    return poster && poster !== "N/A"
        ? poster
        : "https://placehold.co/300x450/20202c/ffffff?text=No+Poster";
}

async function searchMovies() {
    const query = searchInput.value.trim();

    if (!query) {
        message.textContent = "Please enter a movie name.";
        return;
    }

    sectionTitle.textContent = "Search Results";
    moviesContainer.innerHTML = "";
    message.textContent = "Searching movies...";

    try {
        const response = await fetch(
            `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`
        );

        const data = await response.json();

        if (data.Response === "False") {
            message.textContent = data.Error;
            return;
        }

        message.textContent = `Found ${data.totalResults} movies.`;
        displayMovies(data.Search);

    } catch (error) {
        message.textContent = "Something went wrong. Please try again.";
    }
}

function displayMovies(movies) {
    moviesContainer.innerHTML = movies.map(movie => {
        const isFavorite = favorites.some(
            item => item.imdbID === movie.imdbID
        );

        return `
            <div class="movie-card">
                <img
                    src="${escapeHTML(getPoster(movie.Poster))}"
                    alt="${escapeHTML(movie.Title)}"
                >

                <div class="movie-info">
                    <h3>${escapeHTML(movie.Title)}</h3>
                    <p>${escapeHTML(movie.Year)}</p>

                    <div class="card-buttons">
                        <button
                            class="details-btn"
                            data-id="${escapeHTML(movie.imdbID)}">
                            Details
                        </button>

                        <button
                            class="favorite-btn"
                            data-favorite="${escapeHTML(movie.imdbID)}">
                            ${isFavorite ? "❤️ Saved" : "🤍 Save"}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

async function showMovieDetails(id) {
    movieDetails.innerHTML = "<p>Loading details...</p>";
    modal.style.display = "flex";

    try {
        const response = await fetch(
            `${BASE_URL}?apikey=${API_KEY}&i=${encodeURIComponent(id)}&plot=full`
        );

        const movie = await response.json();

        if (movie.Response === "False") {
            movieDetails.textContent = movie.Error;
            return;
        }

        movieDetails.innerHTML = `
            <div class="detail-layout">
                <img
                    src="${escapeHTML(getPoster(movie.Poster))}"
                    alt="${escapeHTML(movie.Title)}"
                >

                <div class="detail-text">
                    <h2>${escapeHTML(movie.Title)}</h2>
                    <p><strong>Year:</strong> ${escapeHTML(movie.Year)}</p>
                    <p><strong>Genre:</strong> ${escapeHTML(movie.Genre)}</p>
                    <p><strong>Rating:</strong> ⭐ ${escapeHTML(movie.imdbRating)}</p>
                    <p><strong>Director:</strong> ${escapeHTML(movie.Director)}</p>
                    <p><strong>Actors:</strong> ${escapeHTML(movie.Actors)}</p>
                    <p><strong>Language:</strong> ${escapeHTML(movie.Language)}</p>
                    <p><strong>Plot:</strong> ${escapeHTML(movie.Plot)}</p>
                </div>
            </div>
        `;

    } catch (error) {
        movieDetails.textContent = "Unable to load movie details.";
    }
}

function toggleFavorite(id) {
    const existing = favorites.find(movie => movie.imdbID === id);

    if (existing) {
        favorites = favorites.filter(movie => movie.imdbID !== id);
    } else {
        const card = [...document.querySelectorAll(".movie-card")].find(
            element => element.querySelector(`[data-favorite="${id}"]`)
        );

        if (!card) return;

        favorites.push({
            imdbID: id,
            Title: card.querySelector("h3").textContent,
            Year: card.querySelector(".movie-info p").textContent,
            Poster: card.querySelector("img").src
        });
    }

    saveFavorites();

    if (sectionTitle.textContent === "My Watchlist") {
        showFavorites();
    } else {
        searchMovies();
    }
}

function showFavorites() {
    sectionTitle.textContent = "My Watchlist";
    moviesContainer.innerHTML = "";

    if (favorites.length === 0) {
        message.textContent = "Your watchlist is empty.";
        return;
    }

    message.textContent = `${favorites.length} saved movies.`;
    displayMovies(favorites);
}

searchBtn.addEventListener("click", searchMovies);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchMovies();
    }
});

moviesContainer.addEventListener("click", event => {
    const detailsButton = event.target.closest("[data-id]");
    const favoriteButton = event.target.closest("[data-favorite]");

    if (detailsButton) {
        showMovieDetails(detailsButton.dataset.id);
    }

    if (favoriteButton) {
        toggleFavorite(favoriteButton.dataset.favorite);
    }
});

document.getElementById("favoritesBtn").addEventListener(
    "click",
    showFavorites
);

document.getElementById("homeBtn").addEventListener("click", () => {
    sectionTitle.textContent = "Search Results";
    moviesContainer.innerHTML = "";
    searchInput.value = "";
    message.textContent = "Search for your favourite movie to get started.";
});

document.getElementById("closeModal").addEventListener("click", () => {
    modal.style.display = "none";
});

modal.addEventListener("click", event => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});
