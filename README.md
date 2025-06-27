# React URL Shortener Web App

## Overview
This project is a URL Shortener web application built with React and TypeScript. It allows users to shorten URLs, customize shortcodes, set expiry dates, and view statistics for each shortened URL. The app uses Material UI for styling and includes a custom logging middleware that sends logs to a remote API.

## Features
- Shorten up to 5 URLs at once
- Custom shortcodes and expiry dates
- Client-side redirection for short URLs
- Statistics page with click analytics
- Material UI design (ivory white background, green navbar)
- Custom logging middleware (logs sent to remote API)

## Project Structure
```
affordReact/
  frontend-test-submission/   # React frontend app
    src/
      App.tsx
      ...
    package.json
  logging-middleware/         # Reusable logging middleware
    logApi.ts
    logger.ts
```

## Prerequisites
- Node.js (v16 or above recommended)
- npm

## Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd affordReact
   ```
2. Install frontend dependencies:
   ```sh
   cd frontend-test-submission
   npm install
   ```

## Running the App
1. Start the React app:
   ```sh
   npm start
   ```
2. Open your browser and go to `http://localhost:3000`

## Logging Middleware
- The logging middleware is located in `logging-middleware/logApi.ts`.
- It sends logs to the remote API: `http://20.244.56.144/evaluation-service/logs`.
- **Authorization:** You must provide a valid Bearer token in the Authorization header. The token is set in the middleware code.
- Logs are sent when key actions occur in the app (e.g., shortening a URL, viewing statistics).

## Notes
- If you encounter a 401 Unauthorized error from the logging API, ensure your token is valid and the Authorization header is correctly formatted as `Bearer <token>`.
- The app does not include a backend for URL storage; all data is managed client-side.

## Author
- Roll No: 22scse1011344

---
Feel free to customize this README as needed for your submission or deployment. 