import express, { json } from "express";
import cors from "cors";
import userRouter from "./routers/userRoutes.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import cookieParser from "cookie-parser";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const app = express();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "USER API",
    },
    servers: [
      {
        url: "http//localhost/3000",
      },
    ],
  },
  apis: ["server/routers/*.js"], // Full path to router files
};
const spacs = swaggerJSDoc(swaggerOptions);
app.use(cors());
app.use(cookieParser());

app.use(json());
app.use("/api/users", userRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spacs));
app.use(globalErrorHandler);
export default app;
