const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Connect to MongoDB
mongoose.connect("mongodb+srv://eswarsai8074:GxlEfEfJ2Fw9g7nj@cluster0.fpvov.mongodb.net/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Price Schema
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

const Price = mongoose.model('Price', priceSchema);

// Middleware
app.use(cors());
app.use(express.json());

/** -------------------------- GET UNIQUE DISTRICTS -------------------------- */
app.get('/api/districts', async (req, res) => {
  try {
    const districts = await Price.aggregate([
      {
        $group: {
          _id: { $toLower: "$district" }, 
          district: { $first: "$district" }
        }
      },
      { $project: { _id: 0, district: 1 } }
    ]);
    res.json(districts.map(d => d.district));
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

/** -------------------------- GET UNIQUE MARKETS BY DISTRICT -------------------------- */
app.get('/api/markets', async (req, res) => {
  try {
    const { district } = req.query;
    if (!district) {
      return res.status(400).json({ error: "District parameter is required" });
    }

    const markets = await Price.aggregate([
      { $match: { district: { $regex: `^${district}$`, $options: 'i' } } },
      { $group: { _id: { $toLower: "$market" }, market: { $first: "$market" } } },
      { $project: { _id: 0, market: 1 } }
    ]);

    // Ensure markets are only returned if data exists
    if (markets.length === 0) {
      return res.status(404).json({ error: "No markets found for this district" });
    }

    res.json(markets.map(m => m.market));
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ error: "Failed to fetch markets" });
  }
});

/** -------------------------- GET PRICES BASED ON DISTRICT & MARKET -------------------------- */
app.get('/api/prices-by-filters', async (req, res) => {
  try {
    const { district, market } = req.query;
    if (!district || !market) {
      return res.status(400).json({ error: "District and market parameters are required" });
    }

    const prices = await Price.find({
      district: { $regex: `^${district}$`, $options: 'i' },
      market: { $regex: `^${market}$`, $options: 'i' }
    });

    // Ensure prices exist before returning data
    if (prices.length === 0) {
      return res.status(404).json({ error: "No data found for the selected district and market" });
    }

    res.json(prices);
  } catch (error) {
    console.error('Error fetching prices by filters:', error);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
