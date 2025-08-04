require("dotenv").config();
const cors = require("cors");
const express = require("express");
const placeRoutes = require("./src/routes/placeRoutes");

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json("API Health is ok");
});
app.use("/api", placeRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
