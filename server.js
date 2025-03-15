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

// GET all prices (for Host App)
app.get('/api/prices', async (req, res) => {
  try {
    const prices = await Price.find().select('_id state district market commodity variety maxPrice avgPrice minPrice');
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

// POST add price (for Host App)
app.post('/api/add-price', async (req, res) => {
  try {
    const newPrice = new Price(req.body);
    await newPrice.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to add price" });
  }
});

// PUT update price (for Host App)
app.put('/api/update-price/:id', async (req, res) => {
  try {
    await Price.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update price" });
  }
});

// DELETE price (for Host App)
app.delete('/api/delete-price/:id', async (req, res) => {
  try {
    await Price.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete price" });
  }
});

// --- USER APP ENDPOINTS ---
// GET unique districts (case-insensitive)
// GET unique districts (case-insensitive)
app.get('/api/districts', async (req, res) => {
  try {
    const districts = await Price.aggregate([
      { 
        $project: { 
          district: { $trim: { input: { $toLower: "$district" } } }  // Trimming whitespace and converting to lowercase for case insensitivity
        }
      },
      { 
        $group: { 
          _id: "$district", // Group by the lowercase trimmed district name
          district: { $first: "$district" } // Pick the first occurrence of each district
        }
      },
      { 
        $project: { _id: 0, district: 1 } // Remove the _id from the output
      }
    ]);
    res.json(districts.map(d => d.district));
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});


// GET unique markets by district (case-insensitive)
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
    res.json(markets.map(m => m.market));
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ error: "Failed to fetch markets" });
  }
});

// GET all prices for selected filters
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
    res.json(prices);
  } catch (error) {
    console.error('Error fetching prices by filters:', error);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

