# Next.js E-Commerce Application

**Name:** Md Sayyub Ansari
**Date:** October 29, 2025

## Project Overview

This is a small e-commerce style web application built using Next.js (App Router, v15.5.6) and TypeScript. It demonstrates various Next.js rendering strategies across different parts of the application, including a product catalog, inventory dashboard, and an admin panel for product management.

The project features include:
* Frontend pages built with React and Tailwind CSS (using shadcn/ui components).
* Backend API routes using Next.js API Routes/route.ts, uploaded:ecommrc/app/api/products/slug/[slug]/route.ts].
* MongoDB database integration via Mongoose.
* Client-side state management for the cart (using Redux Toolkit).
* Basic admin authentication using NextAuth credentials provider.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

* Node.js (v18.18 or later recommended based on Next.js 15 requirements)
* npm (or yarn/pnpm)
* MongoDB Atlas account or a local MongoDB instance

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sayyub80/e-commerce.git
    cd e-commerce
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

### Environment Variables

1.  Create a `.env` file in the root of the project. You can copy the structure from `.env.example` if provided, or create it manually.
2.  Add the following variables to your `.env` file, replacing the placeholder values:

    ```dotenv
    # --- Database ---
    # Replace with your actual MongoDB connection string
    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority

    # --- Authentication ---
    # Generate a strong secret: openssl rand -base64 32
    NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET_HERE"

    # The base URL of your application when running locally
    NEXTAUTH_URL=http://localhost:3000

    # --- Admin ---
    # Credentials for the admin login
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=admin
    ```

### Database Setup

* Ensure your MongoDB instance (specified in `MONGODB_URI`) is running and accessible.
* The application uses Mongoose and will connect to the database specified in your URI. The `Product` model will interact with the `products` collection.
* You can manually add sample product data using MongoDB Compass or `mongosh`. Ensure the data structure matches the `IProductSchema` defined in `lib/models/Product.ts`, including fields like `name`, `slug`, `description`, `price`, `category`, `inventory`, and optionally `imageUrl`.

### Running the Development Server

Execute the following command to start the development server:

```bash
npm run dev
# or
# yarn dev
# or
# pnpm dev