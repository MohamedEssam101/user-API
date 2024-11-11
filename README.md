# User CRUD Application

This is a basic User CRUD (Create, Read, Update, Delete) application built with Express, MongoDB, and various other packages to facilitate functionality like authentication, validation, and testing.

## Prerequisites

- Node.js (version 14 or higher)
- MongoDB (locally or via cloud service like MongoDB Atlas)

## Setup Instructions

### 1. Clone the Repository
bash command  
git clone (repository-url)

cd usercrud
### 2. Install Dependencies
Run the following command to install the necessary dependencies for the application:
npm install


### 3. Set Up Environment Variables
Create a .env.local file in the root directory and set the necessary environment variables, including:

DB_URL=mongodb://127.0.0.1:27017/...
NODE_ENV=development
JWT_SECRET=..
JWT_EXPIRES_IN=..
JWT_COOKIE_EXPIRES_IN=..


### 4. Run the Application
To start the application in development mode, run the following command:

Copy code -> npm run dev
This will start the server using nodemon, so any changes to the code will automatically restart the server.

### 5. Run Tests
To run the test suite, use:


Copy code - > npm test
This will execute the tests using Jest.

### 6. API Documentation
The application is equipped with Swagger for API documentation. To view the API docs, navigate to http://localhost:300/api-docs in your browser after running the server.

