import express , {Request, Response} from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'
import { userInfo } from 'os'
import { Token } from '../types/types'; // Typage pour les données utilisateur dans le token
import { response } from 'express'




const router = express.Router()



router.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Bid, 
          as: 'bids', 
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username'], 
        },
      ],
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

router.get('/api/products/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Bid,
          as: 'bids',
          include: [
            {
              model: User,
              as: 'bidder',
              attributes: ['id','username'],
            },
          ],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username'],
        },
      ],
    });
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/api/products', async (req, res) => {
  try {
    const { name, description, category, originalPrice, pictureUrl, endDate, sellerId } = req.body;
    const product = await Product.create({
      name,
      description,
      category,
      originalPrice,
      pictureUrl,
      endDate,
      sellerId,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/api/products/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, description, category, originalPrice, pictureUrl, endDate, sellerId } = req.body;
    const product = await Product.findByPk(productId);
    if (product) {
      await product.update({
        name,
        description,
        category,
        originalPrice,
        pictureUrl,
        endDate,
        sellerId,
      });
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.delete('/api/products/:productId', async (req: Request & { user?: Token }, res: Response) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findByPk(productId, {
      include: [{
        model: Bid,
        as: 'bids'
      }]
    });
    
    if (product) {
      if (product.sellerId !== req.user?.id && !req.user?.admin) {
        return res.status(401).json({ error: 'User not granted' });
      }
      for (const bid of product.bids) {
        await bid.destroy();
      }
      await product.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router
