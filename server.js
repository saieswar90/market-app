const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://eswarsai8074:GxlEfEfJ2Fw9g7nj@cluster0.fpvov.mongodb.net/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define Schema
const priceSchema = new mongoose.Schema({
  state: String,
  district: String,
  market: String,
  commodity: String,
  variety: String,
  maxPrice: Number,
  avgPrice: Number,
  minPrice: Number,
});

const Price = mongoose.model("Price", priceSchema);

/** -------------------------- GET UNIQUE DISTRICTS -------------------------- */
app.get("/api/districts", async (req, res) => {
  try {
    const districts = await Price.distinct("district");
    res.json(districts.sort()); // Sorting for better UI experience
  } catch (error) {
    console.error("❌ Error fetching districts:", error);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

/** -------------------------- GET UNIQUE MARKETS BY DISTRICT -------------------------- */
app.get("/api/markets", async (req, res) => {
  try {
    const { district } = req.query;
    if (!district) {
      return res.status(400).json({ error: "District parameter is required" });
    }

    const markets = await Price.find({ district }).distinct("market");
    res.json(markets.sort()); // Sorting for better UI experience
  } catch (error) {
    console.error("❌ Error fetching markets:", error);
    res.status(500).json({ error: "Failed to fetch markets" });
  }
});

/** -------------------------- GET UNIQUE COMMODITIES BY MARKET -------------------------- */
app.get("/api/commodities", async (req, res) => {
  try {
    const { market } = req.query;
    if (!market) {
      return res.status(400).json({ error: "Market parameter is required" });
    }

    const commodities = await Price.find({ market }).distinct("commodity");
    res.json(commodities.sort());
  } catch (error) {
    console.error("❌ Error fetching commodities:", error);
    res.status(500).json({ error: "Failed to fetch commodities" });
  }
});

/** -------------------------- GET PRICES BY DISTRICT & MARKET -------------------------- */
app.get("/api/prices", async (req, res) => {
  try {
    const { district, market } = req.query;
    if (!district || !market) {
      return res.status(400).json({ error: "District and market parameters are required" });
    }

    const prices = await Price.find({ district, market });
    res.json(prices);
  } catch (error) {
    console.error("❌ Error fetching prices:", error);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
