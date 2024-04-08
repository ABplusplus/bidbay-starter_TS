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

router.post('/api/products', authMiddleware, async (req : Request & {user? : Token}, res) => {
  const { name, description, pictureUrl, category, originalPrice, endDate } = req.body;

  if (!name || !endDate || typeof originalPrice !== 'number') {
    return res.status(400).json({
      error: "Invalid or missing fields",
      details: ["Required fields: name, endDate, originalPrice"]
    });
  }

  try {
    const sellerId = req.user?.id; 

    const product = await Product.create({
      name,
      description,
      pictureUrl,
      category,
      originalPrice,
      endDate,
      sellerId
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/api/products/:productId', authMiddleware, async (req : Request & {user? : Token}, res) => {
  const { productId } = req.params;
  const userId = req.user?.id; 
  const isAdmin = req.user?.admin; 

  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    if (product.sellerId !== userId && !isAdmin) {
      return res.status(403).json({ error: "User not granted" });
    }

    console.log(product)
    
    
    await Bid.destroy({ where: { productId } });
    await product.destroy();

    res.status(204).send();
    
  } catch (error) {
    
    console.error(error); 
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put('/api/products/:productId', authMiddleware, async (req : Request & {user? : Token}, res) => {
  const { productId } = req.params;
  const userId = req.user?.id; 
  const isAdmin = req.user?.admin; 
  const { name, description, pictureUrl, category, originalPrice, endDate } = req.body;

  if (!name || !endDate) {
    return res.status(400).json({
      error: "Invalid or missing fields",
      details: ["name", "endDate"]
    });
  }

  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.sellerId !== userId && !isAdmin) {
      return res.status(403).json({ error: "User not granted" });
    }

    await product.update({
      name,
      description,
      pictureUrl,
      category,
      originalPrice,
      endDate
    });

    res.status(200).json(product);
  } catch (error) {
    console.error(error); // Pour le débogage
    res.status(500).json({ error: "Internal server error" });
  }
});






export default router
