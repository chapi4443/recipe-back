require("dotenv").config();
require("express-async-errors");
// express

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
// rest of the packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimiter = require("express-rate-limit");
const cors = require("cors");
const fileUpload = require("express-fileupload");
// const mongoSanitize = require("express-mongo-sanitize");

// database
const connectDB = require("./db/connect");

//  routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const recipeRouter = require("./routes/recipeRoutes");
const reviewRouter = require("./routes/reviewRoutes");

// middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000,
//     max: 60,
//   })
// );
// app.use(helmet());
app.use(cors());
app.use(morgan("tiny"));

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static("public"));
app.use(fileUpload());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/recipe", recipeRouter);
app.use("/api/v1/review", reviewRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
