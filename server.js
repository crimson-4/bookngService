const app = require("./app");
const dotnev = require("dotenv");
const mongoose = require("mongoose");
dotnev.config();

const connectionUrl = process.env.MONGODB_CONNECTION_URL.replace(
  "<password>",
  process.env.MONGODB_PASSWORD
);
mongoose.connect(connectionUrl).then(() => {
  console.log("successfully connected to  database");
});

// PORT
const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
//console.log(server);
//console.log("hi", process.env.MONGODB_CONNECTION_URL);
