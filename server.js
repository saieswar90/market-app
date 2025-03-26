const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://eswarsai8074:GxlEfEfJ2Fw9g7nj@cluster0.fpvov.mongodb.net/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
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

/** -------------------------- GET ALL PRICES -------------------------- */
app.get('/api/prices', async (req, res) => {
  try {
    const prices = await Price.find();
    res.json(prices);
  } catch (error) {
    console.error('❌ Error fetching prices:', error);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

/** -------------------------- GET UNIQUE DISTRICTS -------------------------- */
app.get('/api/districts', async (req, res) => {
  try {
    const districts = await Price.distinct('district');
    res.json(districts);
  } catch (error) {
    console.error('❌ Error fetching districts:', error);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

/** -------------------------- GET MARKETS BY DISTRICT -------------------------- */
app.get('/api/markets/:district', async (req, res) => {
  try {
    const { district } = req.params;
    const markets = await Price.find({ district }).distinct('market');
    res.json(markets);
  } catch (error) {
    console.error('❌ Error fetching markets:', error);
    res.status(500).json({ error: "Failed to fetch markets" });
  }
});

/** -------------------------- GET COMMODITIES BY MARKET -------------------------- */
app.get('/api/commodities/:market', async (req, res) => {
  try {
    const { market } = req.params;
    const commodities = await Price.find({ market }).distinct('commodity');
    res.json(commodities);
  } catch (error) {
    console.error('❌ Error fetching commodities:', error);
    res.status(500).json({ error: "Failed to fetch commodities" });
  }
});

/** -------------------------- ADD NEW PRICE RECORD -------------------------- */
app.post('/api/add-price', async (req, res) => {
  try {
    const newPrice = new Price(req.body);
    await newPrice.save();
    res.status(201).json({ message: "✅ Price record added successfully" });
  } catch (error) {
    console.error('❌ Error adding price:', error);
    res.status(500).json({ error: "Failed to add price record" });
  }
});

/** -------------------------- UPDATE EXISTING PRICE RECORD -------------------------- */
app.put('/api/update-price/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Updating Price ID: ${id}`);

    const updatedPrice = await Price.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedPrice) {
      return res.status(404).json({ error: "Price record not found" });
    }

    res.json({ message: "✅ Price record updated successfully", updatedPrice });
  } catch (error) {
    console.error('❌ Error updating price:', error);
    res.status(500).json({ error: "Failed to update price record" });
  }
});

/** -------------------------- DELETE A PRICE RECORD -------------------------- */
app.delete('/api/delete-price/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Deleting price with ID:", id);

    if (!id) {
      return res.status(400).json({ error: "ID parameter is required" });
    }

    const deletedPrice = await Price.findByIdAndDelete(id);

    if (!deletedPrice) {
      return res.status(404).json({ error: "Price record not found" });
    }

    res.json({ message: "✅ Price deleted successfully" });
  } catch (error) {
    console.error('❌ Error deleting price:', error);
    res.status(500).json({ error: "Failed to delete price" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
