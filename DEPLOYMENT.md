# Deployment Guide for Optima-IDP on Render

This project is configured for easy deployment on [Render](https://render.com) using a Blueprints file (`render.yaml`).

## Prerequisites

1.  **Render Account**: Create an account at [render.com](https://render.com).
2.  **MongoDB Database**: You need a hosted MongoDB database (e.g., MongoDB Atlas). Get the **connection string** (URI).
3.  **Git Repository**: Ensure your code is pushed to a GitHub/GitLab repository.

## Step 1: Connect to Render

1.  Log in to your Render Dashboard.
2.  Click **New +** and select **Blueprint**.
3.  Connect your GitHub/GitLab account and select the `Optima-IDP` repository.

## Step 2: Configure Environment Variables

Render will detect the `render.yaml` file and ask you to provide input for the environment variables defined in it.

You will be prompted to enter values for:

*   `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/optima-db`).
*   `JWT_SECRET`: A strong random string for securing authentication tokens.

> **Note**: `VITE_API_BASE_URL` and `ALLOWED_ORIGINS` are automatically handled by the Blueprint to link your Frontend and Backend services.

## Step 3: Deploy

1.  Click **Apply** or **Create Resources**.
2.  Render will start building both the Backend and Frontend services.
3.  Wait for the build to finish. You can monitor the logs in the Render dashboard.

## Verification

Once deployed:

1.  Open the URL of your **Frontend Service**.
2.  Try to **Login** or **Register**.
3.  If successful, your full stack application is live!

## Troubleshooting

-   **CORS Errors**: If you see CORS errors in the browser console, check the `ALLOWED_ORIGINS` in the Backend service settings on Render. It should match your Frontend URL.
-   **Database Connection**: Check the Backend service logs. If it says "MongoDB connected successfully," your `MONGO_URI` is correct.
