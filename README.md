# Next.js E-Commerce Application

**Name:** Md Sayyub Ansari
**Date:** October 29, 2025

## Project Overview

This is a small e-commerce style web application built using Next.js (App Router) and TypeScript. It demonstrates various Next.js rendering strategies across different parts of the application, including a product catalog, inventory dashboard, and an admin panel for product management. The project uses MongoDB as the database via Mongoose and NextAuth for simple admin authentication.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

* Node.js (v18.18 or later recommended)
* npm, yarn, or pnpm
* MongoDB Atlas account (or a local MongoDB instance)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [Your Repository URL]
    cd [Your Repository Folder]
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Environment Variables

1.  Create a `.env` file in the root of the project by copying the example:
    ```bash
    cp .env.example .env
    ```
    *(Note: You currently have a `.env` file. If `.env.example` doesn't exist, create it based on your `.env` but remove sensitive values).*

2.  **Edit the `.env` file** and provide the necessary values:
    * `MONGODB_URI`: Your MongoDB connection string (e.g., from MongoDB Atlas).
    * `NEXTAUTH_SECRET`: A secret key for NextAuth. You can generate one using `openssl rand -base64 32` in your terminal.
    * `NEXTAUTH_URL`: The base URL of your application when running locally (usually `http://localhost:3000`).
    * `ADMIN_USERNAME`: The username for the admin login (default: `admin`).
    * `ADMIN_PASSWORD`: The password for the admin login (default: `admin`).

### Database Setup

* Ensure your MongoDB instance specified in `MONGODB_URI` is running and accessible.
* The application uses Mongoose and will automatically interact with the `ecommerce` database (or the one specified in your URI) and the `products` collection. No manual schema creation is needed initially.
* You can manually add product data using MongoDB Compass or `mongosh` following the structure defined in `lib/models/Product.ts`.

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev