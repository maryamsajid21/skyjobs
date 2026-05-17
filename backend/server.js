require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/config/db");
require("./src/models"); // load all models + associations

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",    require("./src/routes/authRoutes"));
app.use("/api/jobs",    require("./src/routes/jobRoutes"));
app.use("/api/bids",    require("./src/routes/bidRoutes"));
app.use("/api/reviews", require("./src/routes/reviewRoutes"));
app.use("/api/users",   require("./src/routes/userRoutes"));
app.use("/api/admin",   require("./src/routes/adminRoutes"));

app.get("/", (req, res) => res.json({ message: "SkyJobs API is running" }));

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)));
