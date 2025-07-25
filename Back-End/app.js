const express = require("express");
const cors = require("cors");

const morgan = require("morgan");
const path = require("path");

const ErrorController = require("./Controller/errorController");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const usersroutes = require("./Routes/UserRoutes");

const AdminRoute = require("./Routes/AdminRoute");

const PatientDentalRoute = require("./Routes/PatientDentalRoute");

const Notification = require("./Routes/NotificationRoute");

const Logs=require("./Routes/LogsRoute")

const Comments = require("./Routes/CommentRoute")

const Files = require ("./Routes/FilesRoute")

const authentic = require("./Routes/authRouter");

const RatingRoute = require("./Routes/RatingRoute")

const DepartmentRoute = require("./Routes/DepatmentRoute")

const CategoryFileRouter = require("./Routes/CategoryFileRouter")

let app = express();

const logger = function (req, res, next) {
  console.log("Middleware Called");
  next();
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);

app.use(
  session({
    secret: process.env.SECRET_STR,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.CONN_STR,
      ttl: 24 * 60 * 60, // 24 hours in seconds
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(logger);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/users", usersroutes);
app.use("/api/v1/authentication", authentic);
app.use("/api/v1/Patient", PatientDentalRoute);
app.use("/api/v1/Admin", AdminRoute);
app.use("/api/v1/Notification", Notification);
app.use("/api/v1/LogsAudit", Logs);
app.use("/api/v1/Files", Files);
app.use("/api/v1/Department", DepartmentRoute);
app.use("/api/v1/Comments", Comments);
app.use("/api/v1/Ratings", RatingRoute);
app.use("/api/v1/Category", CategoryFileRouter);




app.use(ErrorController);

module.exports = app;
