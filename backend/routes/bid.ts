import authMiddleware from '../middlewares/auth.js'
import { Bid, Product } from '../orm/index.js'
import express, { Request } from 'express'
import { getDetails } from '../validators/index.js'
import { Token } from 'types/types.js'

const router = express.Router();

router.post('/api/products/:productId/bids', authMiddleware, async (req : Request & {user? : Token}, res) => {
  const { productId } = req.params;
  const { price } = req.body;
  const bidderId = req.user?.id; 

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      error: "Invalid or missing fields",
      details: ["price"]
    });
  }

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const bid = await Bid.create({
      productId,
      price,
      bidderId,
      date: new Date().toISOString(), 
    });

    res.status(201).json(bid);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "Internal server error" });
  }
});


router.delete('/api/bids/:bidId',authMiddleware, async (req : Request & {user? : Token}, res) => {
  const { bidId } = req.params;
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', details: 'User not found' });
    }
    
    const currentUserId = req.user.id; 
    const isAdmin = req.user.admin;
  
    try {
      const bid = await Bid.findByPk(bidId);
  
      if (!bid) {
        return res.status(404).json({ error: 'Bid not found' });
      }
  
    
      if (bid.bidderId !== currentUserId && !isAdmin) {
        return res.status(403).json({ error: 'Forbidden: You cannot delete this bid' });
      }
      
  
      await bid.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  

export default router
