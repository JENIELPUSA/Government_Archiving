const express = require("express");
const cors = require("cors");

const morgan = require("morgan");
const path = require("path");

const ErrorController = require("./Controller/errorController");
const session = require("express-session");
const MongoStore = require("connect-mongo");


const AdminRoute = require("./Routes/AdminRoute");


const Notification = require("./Routes/NotificationRoute");

const Retention = require("./Routes/RetentionRoute")

const Logs=require("./Routes/LogsRoute")

const Comments = require("./Routes/CommentRoute")

const FilesRoute = require ("./Routes/FilesRoute")

const authentic = require("./Routes/authRouter");

const RatingRoute = require("./Routes/RatingRoute")

const CategoryFileRouter = require("./Routes/CategoryFileRouter")

const StorageOptimization = require("./Routes/StorageOptimizedRoute")

const SbmemberRoute = require("./Routes/SbmemberRoute")

const ApproverRoute = require("./Routes/ApproverRoute")

const NewsRoute = require("./Routes/NewsRoute")


const FolderRoute = require("./Routes/FolderRoute")

let app = express();

const logger = function (req, res, next) {
  console.log("Middleware Called");
  next();
};

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.set("trust proxy", true);


// CHECK environment variables
console.log("CONN_STR:", process.env.CONN_STR);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);


console.log("Setting up MongoStore with URL:", process.env.CONN_STR);
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
      maxAge: 24 * 60 * 60 * 1000, 
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

//importante ito para pag view ng picture sa table .etcc..
const uploadsDir = path.join(__dirname, '..', 'uploads');

app.use('/uploads', express.static(uploadsDir));

app.use("/api/v1/authentication", authentic);
app.use("/api/v1/Admin", AdminRoute);
app.use("/api/v1/Notification", Notification);
app.use("/api/v1/LogsAudit", Logs);
app.use("/api/v1/Files", FilesRoute);
app.use("/api/v1/Comments", Comments);
app.use("/api/v1/Ratings", RatingRoute);
app.use("/api/v1/Category", CategoryFileRouter);
app.use("/api/v1/Retention", Retention);
app.use("/api/v1/Optimization", StorageOptimization);
app.use("/api/v1/SbmemberRoute", SbmemberRoute);
app.use("/api/v1/Approver", ApproverRoute);
app.use("/api/v1/News", NewsRoute);
app.use("/api/v1/Folder",FolderRoute)


app.use(ErrorController);

module.exports = app;
