# Movie Ranking API

This is a **NestJS-based API** for ranking movies and movie-related people. The application allows users to rank movies, actors, and directors, while providing real-time updates using **Server-Sent Events (SSE)**. Authentication and security are handled using **JWT** and **bcrypt**.

## Features
- **User Authentication**: Secure login and registration using **JWT** and **bcrypt** for password hashing.
- **Movie & People Ranking**: Users can vote and rank movies, actors, and directors.
- **Real-time Updates**: Utilizes **Server-Sent Events (SSE)** to push live updates to clients.
- **RESTful API**: Provides structured API endpoints for managing movies, rankings, and users.
- **Movie Data from TMDB**: Movies and related data are sourced from [The Movie Database (TMDB)](https://www.themoviedb.org/).

## Tech Stack
- **NestJS** - Backend framework
- **TypeScript** - Strongly-typed JavaScript
- **PostgreSQL** - Database
- **Prisma** - Database ORM
- **JWT & bcrypt** - Authentication & security
- **Server-Sent Events (SSE)** - Real-time updates

## API Endpoints

### **Authorization**
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### **Movies**
- `GET /movies` - Get all movies
- `GET /movies/protected` - Get protected movie data (Authorization required)
- `GET /movies/search` - Search for movies or people (Actor, Director, or Title)
- `POST /movies/rate` - Rate a movie or a person (Authorization required)

### **Ranking**
- `POST /movies/:id/rank` - Rank a movie (Authorization required)
- `GET /movies/:id/rank` - Get movie ranking

### **SSE (Real-time updates)**
- `GET /movies/updates` - Receive live updates via Server-Sent Events (SSE)




