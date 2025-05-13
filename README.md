# WebApp

React application

Group-5 / Cs453 / Spring 2025  
**!!! Make sure you use the "main" branch**

---

## ⚙️ How to Run the Project

Follow these steps to run the React frontend locally:

1. **Install dependencies** using npm:

    ```bash
    npm i
    ```

2. **Start the development server:**

    ```bash
    npm run dev
    ```

By default, the app will be available at `http://localhost:5173`.

---

## 🔐 Environment Configuration

Create a `.env` file in the root directory with the following content:

```env
VITE_API_URL=http://localhost:8000
VITE_GITHUB_CLIENT_ID=Ov23libNDZVqB6GpNjNX
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/oauth/callback
CLIENT_SECRET=636584ba17e3be0de62ed295a4ea270a97430379
