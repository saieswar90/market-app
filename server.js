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

/** -------------------------- GET ALL PRICES -------------------------- */
app.get('/api/prices', async (req, res) => {
  try {
    const prices = await Price.find();
    res.json(prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

/** -------------------------- ADD NEW PRICE -------------------------- */
app.post('/api/add-price', async (req, res) => {
  try {
    const { state, district, market, commodity, variety, maxPrice, avgPrice, minPrice } = req.body;

    if (!state || !district || !market || !commodity || !variety || maxPrice === undefined || avgPrice === undefined || minPrice === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newPrice = new Price({ state, district, market, commodity, variety, maxPrice, avgPrice, minPrice });
    await newPrice.save();
    res.status(201).json({ message: "Price added successfully", price: newPrice });

  } catch (error) {
    console.error('Error adding price:', error);
    res.status(500).json({ error: "Failed to add price" });
  }
});

/** -------------------------- UPDATE PRICE BY ID -------------------------- */
app.put('/api/update-price/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedPrice = await Price.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedPrice) {
      return res.status(404).json({ error: "Price record not found" });
    }

    res.json({ message: "Price updated successfully", price: updatedPrice });

  } catch (error) {
    console.error('Error updating price:', error);
    res.status(500).json({ error: "Failed to update price" });
  }
});

/** -------------------------- DELETE PRICE BY ID -------------------------- */
app.delete('/api/delete-price/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPrice = await Price.findByIdAndDelete(id);

    if (!deletedPrice) {
      return res.status(404).json({ error: "Price record not found" });
    }

    res.json({ message: "Price deleted successfully" });

  } catch (error) {
    console.error('Error deleting price:', error);
    res.status(500).json({ error: "Failed to delete price" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
