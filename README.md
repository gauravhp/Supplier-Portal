# Supplier Risk Tracker

This project is a Supplier Risk Tracker application. It consists of a server-side application and a client-side interface.

## Project Structure

- `client/`: Contains the frontend code (likely React/Vue/Svelte with Vite).
- `server/`: Contains the backend code (Node.js/Express).
- `shared/`: Potentially contains code shared between the client and server.
- `public/`: Static assets served by the client.
- `package.json`: Project dependencies and scripts.
- `vite.config.ts`: Vite configuration for the frontend.
- `tailwind.config.ts`: Tailwind CSS configuration.
- `tsconfig.json`: TypeScript configuration.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd SupplierRiskTracker
    ```
2.  **Install dependencies:**
    This project uses npm for package management. Install dependencies for both the root, client, and server.
    ```bash
    npm install
    cd client && npm install && cd ..
    cd server && npm install && cd ..
    ```
    *(Note: Dependencies might be managed solely at the root level depending on the setup. Check `package.json` scripts.)*

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory (or potentially the `server/` directory, depending on where it's accessed). Add the required environment variables. For example:
    ```dotenv
    # .env
    GROQ_API_KEY=your_groq_api_key_here
    ```
    Replace `your_groq_api_key_here` with your actual Groq API key.

## Running the Project

The exact command might differ based on the scripts defined in `package.json`. Common commands include:

1.  **Development Mode:**

    npm run dev 
    # OR
    npm run server:dev # In one terminal
    npm run client:dev # In another terminal
    ```

2.  **Production Build:**
    Look for a `build` script.
    ```bash
    # Example (check package.json for actual script)
    npm run build
    ```
    After building, look for a `start` or `serve` script to run the production version.
