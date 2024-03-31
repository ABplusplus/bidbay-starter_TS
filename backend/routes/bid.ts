import authMiddleware from '../middlewares/auth'
import { Bid, Product } from '../orm/index.js'
import express from 'express'
import { getDetails } from '../validators/index.js'
import withUUID, { uuid } from "vue-uuid";

const router = express.Router()

router.delete('/api/bids/:bidId', async (req, res) => {
  res.status(600).send()
})

router.post('/api/products/:productId/bids', async (req, res) => {
  const { productId } = req.params;
  const { price, bidderId } = req.body; 

  try {
    const product = await Product.findByPk(productId);
    console.log('product', product); 
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const bidData = { 
      id: uuid.v4(),
      productId,
      bidderId,
      price,
      date: new Date(),
    };

    console.log('bidData', bidData);
    const bid = await Bid.create(bidData);

    res.status(201).json(bid);
  } catch (error) {

    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router
