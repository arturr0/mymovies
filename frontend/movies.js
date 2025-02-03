document.addEventListener("DOMContentLoaded", () => {
    
    const query = document.getElementById('searchQuery').value;
    const searchContent = document.getElementById("searchContent");
    const ranksContainer = document.getElementById("ranks");
    const rankImg = document.getElementById("rankImg");
    const rankTitle = document.getElementById("title");
    const rankAvg = document.getElementById("rank");
    const rankPosts = document.getElementById("posts");
    const sendPost = document.getElementById("sendPost");
    const tooltip = document.getElementById("tooltip");
    const searchQuery = document.getElementById('searchQuery');
    const searchContainer = document.getElementById('searchContainer');
    const magnifier = document.getElementById('magnifier');
    magnifier.addEventListener('click', function() {
        const query = document.getElementById('searchQuery').value;
        console.log("query", query);
        if (query !== null && query.trim() !== '') {
            searchMovies();
        }
    });
// Detect if the input is focused
    searchQuery.addEventListener('focus', () => {
        console.log('Input is active (focused)');
        searchContainer.style.border = '4px solid black';
        searchContainer.style.padding = '8px';

        // Add custom styles or classes here if needed
    });

    // Detect when the input loses focus
    searchQuery.addEventListener('blur', () => {
        console.log('Input is not active (blurred)');
        searchContainer.style.border = '2px solid black'
        searchContainer.style.padding = '10px';

        // Remove custom styles or classes here if needed
    });
    document.addEventListener('keydown', function(event) {
        console.log('Event listener registered');
        const query = document.getElementById('searchQuery').value;
        console.log("query", query);
        if (event.key === 'Enter' && query !== null && query.trim() !== '') {
            console.log("enter");
            searchMovies();
        }
    });
    
    let lastQuery = {};
    const moviesRanks = [];
    const peopleRanks = [];
    class Item {
        constructor(id, title, rank, rankerName, post) {
            this.id = id;
            this.title = title;
            this.rank = rank;
            this.rankerName = rankerName;
            this.post = post;
        }
    }

    class Movie extends Item {}
    class Person extends Item {}

    

    document.getElementById("sendPost").addEventListener("click", () => {
        rateItem(sendPost.getAttribute("type"), parseInt(sendPost.getAttribute("id")), sendPost.getAttribute("title"));
        
    });

    document.getElementById("cancel").addEventListener("click", () => {
        searchContent.style.display = 'block';
        ranksContainer.style.display = 'none';
        rankPosts.innerHTML = '';
        
    });

    async function searchMovies() {
        const query = document.getElementById('searchQuery').value;
        const type = document.querySelector('input[name="searchType"]:checked').value;
        console.log("Search Type:", type);
    
        const response = await fetch(`/movies/search?query=${query}&type=${type}`);
        const data = await response.json();
        console.log('Movies Data:', data);
    
        moviesRanks.length = 0;
        peopleRanks.length = 0;
    
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';
    
        if (data.movies) {
            data.movies.forEach(movie => {
                console.log(`Movie: ${movie.title}`, movie.ratings);
                if (!movie.poster) return;
                const movieElement = document.createElement('div');
                movieElement.classList.add('item');      
                movieElement.innerHTML = `
                    <h3 class="title" data-title="${movie.title} (${movie.year})">${movie.title} (${movie.year})</h3>
                    <div class="img" style="background-image: url(${movie.poster});"></div>`
                    ;
                if (movie.ratings) {
                    movie.ratings.forEach(rank => {
                        const rankMovie = new Movie(movie.id, movie.title, rank.rating, rank.userEmail, rank.comment);
                        moviesRanks.push(rankMovie);
                    });
                }
                const voteCount = movie.ratings ? movie.ratings.length : 0;
                const voteText = voteCount === 1 ? '1 vote' : `${voteCount} votes`;
                const avgRating = movie.ratings && movie.ratings.length
                    ? Math.round(movie.ratings.reduce((sum, r) => sum + r.rating, 0) / movie.ratings.length)
                    : 'No rating yet';
                const moviesVotes = document.createElement('p');
                moviesVotes.classList = 'votesNo';
                moviesVotes.textContent = voteCount;
                
                const ratingElement = document.createElement('div');
                moviesVotes.textContent = voteText;
                //ratingElement.textContent = `Rating: ${avgRating}`;
                for (let i = 0; i < 5; i++) {
                    const star = document.createElement("span");
                    star.style.color = i < avgRating ? "gold" : "gray";
                    star.innerHTML = "&#9733;";
                    ratingElement.appendChild(star); // Append each star
                } 
                
                movieElement.appendChild(moviesVotes);
                movieElement.appendChild(ratingElement);
                
                resultsDiv.appendChild(movieElement);
    
                const movieImg = movieElement.querySelector('.img');
                if (movieImg) {
                    movieImg.addEventListener('click', () => {
                        const clickedMovie = moviesRanks.filter(movieRank => movieRank.id === movie.id);
                        console.log('Clicked Movie Data:', clickedMovie);
    
                        searchContent.style.display = 'none';
                        rankTitle.textContent = movie.title;
                        rankAvg.textContent = avgRating;
    
                        rankPosts.innerHTML = ''; // Clear previous posts
                        clickedMovie.forEach(moviePost => {
                            const postDiv = document.createElement("div");
                            const user = document.createElement("p");
                            user.textContent = moviePost.rankerName;
                            rankPosts.appendChild(postDiv)
                            const postRank = document.createElement("div");
                            postRank.textContent = moviePost.rank;
                            postDiv.classList.add("post");
                            postDiv.setAttribute("user", moviePost.rankerName)
                            const post = document.createElement("p");
                            post.textContent = moviePost.post;
                            postDiv.appendChild(user);
                            postDiv.appendChild(postRank);
                            postDiv.appendChild(post);
                        });
    
                        rankImg.src = movie.poster;
                        ranksContainer.style.display = 'block';
    
                        sendPost.setAttribute("type", "movie");
                        sendPost.setAttribute("id", movie.id);
                        sendPost.setAttribute("title", movie.title);
                    });
                } else {
                    console.error('Movie image not found for:', movie.title);
                }
            });
        } else if (data.people) {
            data.people.forEach(person => {
                console.log(`Person: ${person.name}`, person.ratings);
                if (!person.profile) return; 
                const personElement = document.createElement('div');
                personElement.classList.add('item');
                personElement.innerHTML = `
                    <h3 class="title" data-title="${person.name}">${person.name}</h3>
                    <div class="img" style="background-image: url(${person.profile});"></div>`;
                if (person.ratings) {
                    person.ratings.forEach(rank => {
                        const rankPerson = new Person(person.id, person.name, rank.rating, rank.userEmail, rank.comment);
                        peopleRanks.push(rankPerson);
                    });
                }
                const voteCount = person.ratings ? person.ratings.length : 0;
                const voteText = voteCount === 1 ? '1 vote' : `${voteCount} votes`;
                const avgRating = person.ratings && person.ratings.length
                    ? Math.round(person.ratings.reduce((sum, r) => sum + r.rating, 0) / person.ratings.length)
                    : 'No rating yet';
                const personsVote = document.createElement('p');
                personsVote.classList = 'votesNo';
                personsVote.textContent = voteText;

                const ratingElement = document.createElement('p');
                ratingElement.textContent = `Rating: ${avgRating}`;
                personElement.appendChild(ratingElement);
                personElement.appendChild(personsVote);
                resultsDiv.appendChild(personElement);
    
                const personImg = personElement.querySelector('.img');
                if (personImg) {
                    personImg.addEventListener('click', () => {
                        const clickedPerson = peopleRanks.filter(personRank => personRank.id === person.id);
                        console.log('Clicked Person Data:', clickedPerson);
    
                        rankTitle.textContent = person.name;
                        rankAvg.textContent = avgRating;
    
                        rankPosts.innerHTML = ''; // Clear previous posts
                        clickedPerson.forEach(personPost => {
                            // const div = document.createElement("div");
                            // div.textContent = personPost.rank;
                            // rankPosts.appendChild(div);
                            const postDiv = document.createElement("div");
                            const user = document.createElement("p");
                            user.textContent = personPost.rankerName;
                            rankPosts.appendChild(postDiv)
                            const postRank = document.createElement("div");
                            postRank.textContent = personPost.rank;
                            postDiv.classList.add("post");
                            postDiv.setAttribute("user", personPost.rankerName)
                            const post = document.createElement("p");
                            post.textContent = personPost.post;
                            postDiv.appendChild(user);
                            postDiv.appendChild(postRank);
                            postDiv.appendChild(post);
                        });
    
                        searchContent.style.display = 'none';
                        rankImg.src = person.profile;
                        ranksContainer.style.display = 'block';
    
                        sendPost.setAttribute("type", "person");
                        sendPost.setAttribute("id", person.id);
                        sendPost.setAttribute("title", person.name);
                    });
                } else {
                    console.error('Person image not found for:', person.name);
                }
            });
        } else {
            alert('No results found.');
        }
    
        console.log("Movies Ranks Array:", moviesRanks);
        console.log("People Ranks Array:", peopleRanks);
    }
    
    async function rateItem(type, id, title) {
        const token = localStorage.getItem('jwt');
        const rating = prompt(`Please rate this ${type}: ${title}`);

        if (rating && !isNaN(rating) && rating >= 1 && rating <= 5) {
            try {
                const response = await fetch(`https://nest-db.onrender.com/movies/rate`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type,      // "movie" or "person"
                        id,        // TMDB ID of the movie/person
                        title,     // Title or name of the movie/person
                        rating: parseInt(rating),  // Rating from user
                        post: document.getElementById('writePost').value,
                    }),
                });

                const data = await response.json();
                if (data.success) {
                    alert('Thank you for your rating!');
                    
                    await searchMovies();  // Wait until moviesRanks is updated
                    
                    const clickedMovie = moviesRanks.filter(movieRank => movieRank.id === parseInt(sendPost.getAttribute("id")));
                    console.log(clickedMovie);
                    const avgRating = Math.round(
                        clickedMovie.reduce((sum, movie) => sum + movie.rank, 0) / clickedMovie.length
                    );
                    rankAvg.textContent = avgRating; 
                    rankPosts.innerHTML = ''; // Clear previous posts
                    clickedMovie.forEach(moviePost => {
                        const postDiv = document.createElement("div");
                        const user = document.createElement("p");
                        user.textContent = moviePost.rankerName;
                        rankPosts.appendChild(postDiv);
                        const postRank = document.createElement("div");
                        postRank.textContent = moviePost.rank;
                        postDiv.classList.add("post");
                        postDiv.setAttribute("user", moviePost.rankerName);
                        const post = document.createElement("p");
                        post.textContent = moviePost.post;
                        postDiv.appendChild(user);
                        postDiv.appendChild(postRank);
                        postDiv.appendChild(post);
                    });
                }

            } catch (error) {
                console.error('Error rating item:', error);
            }
        } else {
            alert('Invalid rating! Please provide a number between 1 and 5.');
        }
    }
    document.getElementById('results').addEventListener('mouseover', (e) => {
        if (e.target.classList.contains("title")) {
            // Check if text overflows
            if (e.target.scrollWidth > e.target.clientWidth) {
                tooltip.textContent = e.target.getAttribute("data-title");
                tooltip.style.display = "block";
                tooltip.style.position = "absolute";
                
                // Update position on hover
                updateTooltipPosition(e);
            }
        }
    });
    
    document.getElementById('results').addEventListener('mousemove', (e) => {
        if (e.target.classList.contains("title")) {
            updateTooltipPosition(e);
        }
    });
    
    document.getElementById('results').addEventListener('mouseout', (e) => {
        if (e.target.classList.contains("title")) {
            tooltip.style.display = "none";
        }
    });
    
    // Function to update the tooltip position
    function updateTooltipPosition(e) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const documentScrollTop = window.scrollY;  // Get the current page scroll
    
        // Get the mouse position relative to the document
        let tooltipX = e.pageX + 10; // Offset 10px to the right of the cursor
        let tooltipY = e.pageY + 20; // Offset 20px below the cursor
    
        // Check if the tooltip would overflow horizontally (on the right side)
        if (tooltipX + tooltipRect.width > viewportWidth) {
            tooltipX = viewportWidth - tooltipRect.width - 10; // Adjust to the left if it overflows on the right
        }
    
        // Check if the tooltip would overflow vertically (on the bottom)
        if (tooltipY + tooltipRect.height > viewportHeight + documentScrollTop) {
            tooltipY = (viewportHeight + documentScrollTop) - tooltipRect.height - 10; // Adjust upwards if it overflows on the bottom
        }
    
        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;
    
        // Ensure the tooltip stays within the document boundaries even when scrolling
        if (tooltipY + tooltipRect.height > documentScrollTop + viewportHeight) {
            tooltip.style.transform = `translateY(-${tooltipRect.height + 10}px)`;
        } else {
            tooltip.style.transform = "none"; // Reset if the tooltip fits within the screen
        }
    }
    
    
});
