const express = require("express");
const mongodb = require("./shared/mongo");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await mongodb.connect();

    app.use(cors());
    app.use(express.json());
    app.use("/users", userRoutes);
    app.use("/admin", adminRoutes);
    app.listen(PORT, () => {
      console.log("Server running in PORT", PORT);
    });
  } catch (err) {
    console.log(err);
  }
})();
