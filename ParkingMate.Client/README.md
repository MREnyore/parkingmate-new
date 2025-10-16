### Getting Started

This is the **frontend** (React + Vite) for ParkingMate. It can run in two modes:

#### Development Mode (Hot Reload)

Run with hot module replacement for rapid development:

1. Clone the repository
2. Change into the project directory: `cd ParkingMate.Client`
3. Install dependencies: `pnpm install --frozen-lockfile`
4. Start the development server: `pnpm dev`
5. Open `http://localhost:5173` in your browser

**Note**: The frontend will proxy API requests to the backend at `https://localhost:5001`. Make sure the backend is running.

#### Production Mode

Build the frontend and serve it from the backend:

1. Build the frontend: `pnpm build` (outputs to `../ParkingMate/wwwroot/`)
2. Start the backend from the parent directory
3. Access the app at `https://localhost:5001` (both frontend and API on the same port)
# Test change
