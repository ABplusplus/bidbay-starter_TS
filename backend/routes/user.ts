import express from 'express'
import { User, Product, Bid } from '../orm/index.js'

const router = express.Router()

router.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: Product,
        as: 'products', 
        include: [{
          model: Bid,
          as: 'bids'
        }]
      }, {
        model: Bid,
        as: 'bids',
        include: [{
          model: Product,
          as: 'product'
        }]
      }]
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const formattedResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      admin: user.admin,
      products: user.products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        originalPrice: product.originalPrice,
        pictureUrl: product.pictureUrl,
        endDate: product.endDate,
        bids: product.bids.map(bid => ({
          id: bid.id,
          price: bid.price,
          date: bid.date,
        
        }))
      })),
      bids: user.bids.map(bid => ({
        id: bid.id,
        price: bid.price,
        date: bid.date,
        product: {
          id: bid.product.id,
          name: bid.product.name,
          endDate : bid.product.endDate,
          
        }
      }))
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router
