import mongoose from "mongoose";

const { connect, connection } = mongoose;

import { config } from "dotenv";
import { createServer } from "http";
config({ path: "./.env.local" });

import app from "./app.js"; // Importing app from app.js

const DB = process.env.DB_URL;
console.log(DB);
export const connectToDB = (dbUrl = DB) => {
  return connect(dbUrl, {});
};
export const closeDBConnection = async () => {
  await connection.close();
};

// Call connectToDB when the server starts
connectToDB(DB).then(() => console.log("DB connection successful!"));

const httpServer = createServer(app); //created the http server

const PORT = process.env.PORT || 3000;

export const server = httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
