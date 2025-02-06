const currentQuerry =  {};

document.addEventListener("userDataReady", () => {
	console.log(userData.user);
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
	const starsInfo = document.getElementById('starsInfo');
	const votesInfo = document.getElementById('votesInfo');
	

	const magnifier = document.getElementById('magnifier');
 
	
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
	magnifier.addEventListener('click', function() {
		const query = document.getElementById('searchQuery').value;
		console.log("query", query);
		if (query !== null && query.trim() !== '') {
			searchMovies();
		}
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
		rateItem(sendPost.getAttribute("type"), parseInt(sendPost.getAttribute("itemID")), sendPost.getAttribute("title"));
		
	});

	document.getElementById("cancel").addEventListener("click", () => {
		console.log("click");
		searchContent.style.display = 'block';
		ranksContainer.style.display = 'none';
		document.getElementById('writePost').value = '';
		rankPosts.innerHTML = '';
		selectedRating = 0;
		document.getElementById("cancel").style.display = 'none';
		const elements = document.querySelectorAll('.star'); 
		elements.forEach(element => {
			if (element.classList.contains('star')) {
				element.classList.remove('filled');
		  }
		})
		

		
	});

	let controller = new AbortController();

	async function searchMovies() {
		controller.abort(); // Cancel previous request
		controller = new AbortController(); // Create a new controller

		try {
			const query = document.getElementById('searchQuery').value;
			const type = document.querySelector('input[name="searchType"]:checked').value;
			console.log("Search Type:", type);

			const response = await fetch(`/movies/search?query=${query}&type=${type}&id=${userData.user.id}`, {
				signal: controller.signal, // Attach abort signal
			});

			const data = await response.json();
			console.log('Movies Data:', data);
			if (Number(data.querySenderID) == userData.user.id) {
				currentQuerry.type = data.queryType;
				currentQuerry.text = data.queryText;
				currentQuerry.id = Number(data.querySenderID);
			}
			console.log(currentQuerry);
			moviesRanks.length = 0;
			peopleRanks.length = 0;

			const resultsDiv = document.getElementById('results');
			resultsDiv.innerHTML = '';

			if (data.movies) {
				data.movies.forEach(movie => {
					if (!movie.poster) return;
					resultsDiv.appendChild(createItemElement(movie, 'movie'));
				});
			} else if (data.people) {
				data.people.forEach(person => {
					if (!person.profile) return;
					resultsDiv.appendChild(createItemElement(person, 'person'));
				});
			} else {
				alert('No results found.');
			}

		} catch (error) {
			if (error.name === 'AbortError') {
				console.log("Previous request aborted");
			} else {
				console.error("Error fetching movies:", error);
			}
		}
	}

	// Run searchMovies every 5 seconds, aborting previous requests if new ones start
	//setInterval(searchMovies, 5000);

	
	function createItemElement(item, type) {
		const itemElement = document.createElement('div');
		itemElement.classList.add('item');
		itemElement.innerHTML = `
			<p class="title" data-title="${type === 'movie' ? `${item.title}${item.year !== 'N/A' ? ` (${item.year})` : ''}` : item.name}">
				${type === 'movie' ? `${item.title}${item.year !== 'N/A' ? ` (${item.year})` : ''}` : item.name}
			</p>
			<div class="img" style="background-image: url(${type === 'movie' ? item.poster : item.profile});"></div>`;
		if (item.ratings) {
			item.ratings.forEach(rank => {
				const rankedItem = type === 'movie' 
					? new Movie(item.id, item.title, rank.rating, rank.userEmail, rank.comment) 
					: new Person(item.id, item.name, rank.rating, rank.userEmail, rank.comment);
				
				type === 'movie' ? moviesRanks.push(rankedItem) : peopleRanks.push(rankedItem);
			});
		}
	
		const voteCount = item.ratings ? item.ratings.length : 0;
		const voteText = voteCount === 1 ? '1 vote' : `${voteCount} votes`;
		const avgRating = item.ratings && item.ratings.length
			? Math.round(item.ratings.reduce((sum, r) => sum + r.rating, 0) / item.ratings.length)
			: 'No rating yet';
	
		const votesElement = document.createElement('p');
		votesElement.classList.add('votesNo');
		votesElement.textContent = voteText;
	
		const ratingElement = createRatingElement(avgRating);
	
		itemElement.appendChild(votesElement);
		itemElement.appendChild(ratingElement);
	
		itemElement.querySelector('.img').addEventListener('click', () => handleItemClick(item, type, avgRating, voteText));
		
		return itemElement;
	}
	
	function createRatingElement(avgRating) {
		const ratingElement = document.createElement('div');
		ratingElement.classList.add('ratedStars');
	
		for (let i = 0; i < 5; i++) {
			const star = document.createElement("span");
			star.style.color = i < avgRating ? "gold" : "gray";
			star.innerHTML = "&#9733;";
			ratingElement.appendChild(star);
		}
	
		return ratingElement;
	}
	
	function handleItemClick(item, type, avgRating, voteText) {
		const rankedItems = type === 'movie' ? moviesRanks : peopleRanks;
		const clickedItem = rankedItems.filter(rank => rank.id === item.id);
		console.log(`Clicked ${type} Data:`, clickedItem);
	
		rankTitle.textContent = type === 'movie' ? item.title : item.name;
		//rankAvg.textContent = avgRating;
		rankPosts.innerHTML = '';
		votesInfo.textContent = voteText;
	
		clickedItem.forEach(post => {
			const postDiv = document.createElement("div");
			postDiv.classList.add("post");
			postDiv.setAttribute("user", post.rankerName);
	
			const user = document.createElement("p");
			user.classList.add("userName");
			console.log("user", userData.user.email);
			const userName = userData.user.email === post.rankerName ? "Your post" : post.rankerName; 
			user.textContent = userName;
			
			const postRank = document.createElement("div");
			postRank.classList.add("userRank")
			// postRank.textContent = post.rank;
			
			const postText = document.createElement("p");
			postText.classList.add("userPost");

			postText.textContent = post.post;
	
			postDiv.appendChild(user);
			postDiv.appendChild(postText);
			postDiv.appendChild(postRank);
			if (userData.user.email == post.rankerName) postDiv.style.border = "6px ridge gold";
			for (let i = 0; i < 5; i++) {
				const star = document.createElement("span");
				star.style.color = i < post.rank ? "gold" : "gray";
				star.innerHTML = "&#9733;";
				postRank.appendChild(star);
			}
	
			rankPosts.appendChild(postDiv);
		});
	
		starsInfo.innerHTML = '';
		starsInfo.appendChild(createRatingElement(avgRating));
		searchContent.style.display = 'none';
		rankImg.src = type === 'movie' ? item.poster : item.profile;
		ranksContainer.style.display = 'block';
		document.getElementById("cancel").style = 'block';
	
		sendPost.setAttribute("type", type);
		sendPost.setAttribute("itemID", item.id);
		sendPost.setAttribute("title", type === 'movie' ? item.title : item.name);
	}
	
	
	async function rateItem(type, id, title) {
		const token = localStorage.getItem('jwt');
		//const rating = prompt(`Please rate this ${type}: ${title}`);
		//const rating = prompt(`Please rate this ${type}: ${title}`);

		

		if (selectedRating && !isNaN(selectedRating) && selectedRating >= 1 && selectedRating <= 5) {
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
						rating: selectedRating,  // Rating from user
						post: document.getElementById('writePost').value,
						queryType: currentQuerry.type,    // ✅ Include search query type
						queryText: currentQuerry.text,    // ✅ Include search query text
						querySenderID: currentQuerry.id,
						userName: userData.user.email,
					}),
				});

				const data = await response.json();
				if (data.success) {
					alert('Thank you for your rating!');
					
					await searchMovies();  // Wait until moviesRanks is updated
					console.log(peopleRanks, type);
					//const clickedMovie = moviesRanks.filter(movieRank => movieRank.id === parseInt(sendPost.getAttribute("id")));
					const ranksArray = type === "movie" ? moviesRanks : peopleRanks;
					clickedMovie = ranksArray.filter(rank => rank.id === parseInt(sendPost.getAttribute("itemID")));
					console.log(clickedMovie);
					const avgRating = Math.round(
						clickedMovie.reduce((sum, movie) => sum + movie.rank, 0) / clickedMovie.length
					);
					//rankAvg.textContent = avgRating;
					starsInfo.innerHTML = '';
					for (let i = 0; i < 5; i++) {""
						const star = document.createElement("span");
						star.style.color = i < avgRating ? "gold" : "gray";
						star.innerHTML = "&#9733;";
						starsInfo.appendChild(star);
					}
					const voteCount = clickedMovie.length;
					const voteText = voteCount === 1 ? '1 vote' : `${voteCount} votes`;
					votesInfo.textContent = voteText;
					rankPosts.innerHTML = ''; // Clear previous posts
					clickedMovie.forEach(moviePost => {
						const postDiv = document.createElement("div");
						const user = document.createElement("p");
						user.classList.add("userName");
						console.log("user", userData.user.email);
						const userName = userData.user.email === moviePost.rankerName ? "Your post" : moviePost.rankerName
						user.textContent = userName;
						rankPosts.appendChild(postDiv);
						const postRank = document.createElement("div");
						postRank.classList.add("userRank")
						// postRank.textContent = moviePost.rank;
						postDiv.classList.add("post");
						postDiv.setAttribute("user", moviePost.rankerName);
						const post = document.createElement("p");
						post.classList.add("userPost");
						post.textContent = moviePost.post;
						postDiv.appendChild(user);
						postDiv.appendChild(post);
						postDiv.appendChild(postRank);
						if (userData.user.email == moviePost.rankerName) postDiv.style.border = "6px ridge gold";

						for (let i = 0; i < 5; i++) {
							const star = document.createElement("span");
							star.style.color = i < moviePost.rank ? "gold" : "gray";
							star.innerHTML = "&#9733;";
							postRank.appendChild(star);
						}
						
					});
				}

			} catch (error) {
				console.error('Error rating item:', error);
			}
		} else {
			alert('Invalid rating! Please provide a number between 1 and 5.');
		}
	}
	
	
	const stars = document.querySelectorAll('.star');
		
	let selectedRating = 0;
		
	stars.forEach((star, index) => {
		star.addEventListener('mouseover', function() {
			stars.forEach((s, i) => {
				s.classList.toggle('filled', i <= index); // Light up stars progressively
			});
		});
		
		star.addEventListener('mouseleave', function() {
			stars.forEach((s, i) => {
				s.classList.toggle('filled', i < selectedRating); // Restore previous selection
			});
		});
		
		star.addEventListener('click', function() {
			selectedRating = index + 1;
			console.log(`Selected Rating: ${selectedRating} stars`);
			
			// Lock in selected stars
			stars.forEach((s, i) => {
				s.classList.toggle('filled', i < selectedRating);
			});
			
			// Hide the stars after 5 seconds
			// setTimeout(() => {
			// 	ratingContainer.classList.add('hidden');
			// }, 5000);
		});
	});
	//document.addEventListener('DOMContentLoaded', () => {
		const eventSource = new EventSource('/movies/updates');
	
	eventSource.onopen = () => {
	  console.log('Connection to server opened.');
	};
	
	eventSource.onerror = (error) => {
	  console.error('Error in EventSource connection:', error);
	};
	
	
	eventSource.onmessage = async (event) => {
		const data = JSON.parse(event.data);
		//console.log(`New ${data.type} update: ${data.title}`);
		console.log(`data.querySenderID ${data.querySenderID} = userData.user.id ${userData.user.id} || (currentQuerry.type ${currentQuerry.type} !data.queryType ${data.queryType}  &currentQuerry.text ${currentQuerry.text} ! data.queryText ${data.queryText}`)
		if (data.querySenderID == userData.user.id || !(currentQuerry.type == data.queryType && currentQuerry.text == data.queryText)) return;
		//if (currentQuerry.type == data.queryType && currentQuerry.text == data.queryText) {
			//if (currentQuerry.type != data.queryType && currentQuerry.text != data.queryText)
			console.log("update", data);
			await searchMovies();
			//console.log(peopleRanks, type);
			//const clickedMovie = moviesRanks.filter(movieRank => movieRank.id === parseInt(sendPost.getAttribute("id")));
			const ranksArray = data.queryType === "title" ? moviesRanks : peopleRanks;
			clickedMovie = ranksArray.filter(rank => rank.id === parseInt(sendPost.getAttribute("itemID")));
			console.log(clickedMovie);
			const avgRating = Math.round(
				clickedMovie.reduce((sum, movie) => sum + movie.rank, 0) / clickedMovie.length
			);
			//rankAvg.textContent = avgRating;
			starsInfo.innerHTML = '';
			for (let i = 0; i < 5; i++) {""
				const star = document.createElement("span");
				star.style.color = i < avgRating ? "gold" : "gray";
				star.innerHTML = "&#9733;";
				starsInfo.appendChild(star);
			}
			const voteCount = clickedMovie.length;
			const voteText = voteCount === 1 ? '1 vote' : `${voteCount} votes`;
			votesInfo.textContent = voteText;
			rankPosts.innerHTML = ''; // Clear previous posts
			clickedMovie.forEach(moviePost => {
				const postDiv = document.createElement("div");
				const user = document.createElement("p");
				user.classList.add("userName");
				console.log("user", userData.user.email);
				const userName = userData.user.email === moviePost.rankerName ? "Your post" : moviePost.rankerName
				user.textContent = userName;
				rankPosts.appendChild(postDiv);
				const postRank = document.createElement("div");
				postRank.classList.add("userRank")
				// postRank.textContent = moviePost.rank;
				postDiv.classList.add("post");
				postDiv.setAttribute("user", moviePost.rankerName);
				const post = document.createElement("p");
				post.classList.add("userPost");
				post.textContent = moviePost.post;
				postDiv.appendChild(user);
				postDiv.appendChild(post);
				postDiv.appendChild(postRank);
				if (userData.user.email == moviePost.rankerName) postDiv.style.border = "6px ridge gold";
		
				for (let i = 0; i < 5; i++) {
					const star = document.createElement("span");
					star.style.color = i < moviePost.rank ? "gold" : "gray";
					star.innerHTML = "&#9733;";
					postRank.appendChild(star);
				}
				
			});
		
	};
	  
	
		
});
