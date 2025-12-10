# Optima IDP Documentation

## Project Overview

Optima IDP is a comprehensive internal developer platform.

### Directory Structure

- **`../backend/`**: Node.js/Express.js API server.
- **`../frontend/`**: React.js SPA (Single Page Application).
- **`../recommender/`**: Python FastAPI service for AI recommendations.
- **`../docs/`**: Documentation and setup guides (You are here).

### Important Notes

- **`.venv/`** (in root): This directory is a Python **Virtual Environment**. It contains the installed Python dependencies for the `recommender` service. It is **essential** for running the recommender service locally and should **NOT** be deleted unless you are re-installing dependencies.

## Documentation Index

- **[Local Setup Guide](LOCAL_SETUP.md)**: Detailed instructions on how to run this project locally (without Docker).
- **[System Design](system-design.md)**: Architecture, data flow, and component details.
- **[API Specification](api-spec.md)**: Details about the backend API endpoints.
- **[Quick Start](QUICKSTART.md)**: Quick start guide (targeted at the old Docker setup, check Local Setup for current non-Docker usage).

## Quick Start (Summary)

1.  **Backend**: `cd ../backend` -> `npm install` -> `npm run dev`
2.  **Recommender**: `cd ../recommender` -> `.\.venv\Scripts\Activate` -> `python main.py`
3.  **Frontend**: `cd ../frontend` -> `npm install` -> `npm run dev`
