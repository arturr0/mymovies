async function fetchMovies() {
    const token = localStorage.getItem('jwt');
    console.log('Fetched token:', token);

    if (!token) {
      console.error('No JWT token found! Redirecting to login.');
      window.location.href = '/';
      return;
    }

    try {
      const response = await fetch('https://nest-db.onrender.com/movies/protected', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Request failed with status:', response.status);
        console.error('Response text:', await response.text());
        return;
      }

      const data = await response.json();
      console.log('Movies:', data.message);  // Log the message from the server
      console.log('User:', data.user);  // Log the user object from the server

      // Optionally, display user information on the page
    //   const userDiv = document.createElement('div');
    //   userDiv.innerHTML = `
    //     <h2>Welcome, ${data.user.id}</h2>
    //     <p>Email: ${data.user.email}</p>
    //   `;
    //   document.body.appendChild(userDiv);

    } catch (error) {
      console.error('Error during fetch:', error);
    }
  }

  window.onload = function() {
    console.log('Page loaded, fetching movies...');
    fetchMovies();
  };
