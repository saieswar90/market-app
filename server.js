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
    let districts = await Price.distinct("district").collation({ locale: "en", strength: 2 });

    // Remove empty/null values, trim, and sort
    districts = [...new Set(districts.map(d => d?.trim()).filter(Boolean))].sort();

    res.json(districts);
  } catch (error) {
    console.error("❌ Error fetching districts:", error);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

/** -------------------------- GET ALL MARKETS BY DISTRICT -------------------------- */
app.get("/api/markets", async (req, res) => {
  try {
    const { district } = req.query;
    if (!district) {
      return res.status(400).json({ error: "District parameter is required" });
    }

    // Aggregation pipeline to group markets by district
    const markets = await Price.aggregate([
      { 
        $match: { district: { $regex: new RegExp(`^${district}$`, "i") } } 
      }, // Case-insensitive match
      {
        $group: { 
          _id: "$district", 
          markets: { $addToSet: "$market" } 
        }
      }
    ]);

    if (markets.length === 0) {
      return res.status(404).json({ error: "No markets found for this district" });
    }

    // Extract and sort the markets list
    res.json(markets[0].markets.sort());
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

    let commodities = await Price.find({ market: { $regex: `^${market}$`, $options: "i" } })
      .distinct("commodity");

    // Remove empty/null values, trim, and sort
    commodities = [...new Set(commodities.map(c => c?.trim()).filter(Boolean))].sort();

    res.json(commodities);
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

    const prices = await Price.find({
      district: { $regex: `^${district}$`, $options: "i" },
      market: { $regex: `^${market}$`, $options: "i" }
    });

    res.json(prices);
  } catch (error) {
    console.error("❌ Error fetching prices:", error);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});
app.post("/api/add-price", async (req, res) => {
  try {
    const newPrice = new Price(req.body);
    await newPrice.save();
    res.status(201).json({ message: "Price added successfully" });
  } catch (error) {
    console.error("❌ Error adding price:", error);
    res.status(500).json({ error: "Failed to add price" });
  }
});

/** -------------------------- UPDATE PRICE -------------------------- */
app.put("/api/update-price/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPrice = await Price.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedPrice) {
      return res.status(404).json({ error: "Price not found" });
    }

    res.json({ message: "Price updated successfully" });
  } catch (error) {
    console.error("❌ Error updating price:", error);
    res.status(500).json({ error: "Failed to update price" });
  }
});

/** -------------------------- DELETE PRICE -------------------------- */
app.delete("/api/delete-price/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPrice = await Price.findByIdAndDelete(id);

    if (!deletedPrice) {
      return res.status(404).json({ error: "Price not found" });
    }

    res.json({ message: "Price deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting price:", error);
    res.status(500).json({ error: "Failed to delete price" });
  }
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
