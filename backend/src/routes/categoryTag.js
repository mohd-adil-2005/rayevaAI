import express from 'express';
import { ProductCatalog } from '../models/ProductCatalog.js';
import { generateCategoryAndTags } from '../ai/categoryTagAi.js';

const router = express.Router();

/** POST /api/category-tag/generate - Generate and store in DB */
router.post('/generate', async (req, res) => {
  try {
    const { name, description } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required (non-empty string)' });
    }
    const { structured, raw } = await generateCategoryAndTags(
      name.trim(),
      description ? String(description).trim() : null
    );
    const doc = await ProductCatalog.create({
      name: name.trim(),
      description: description ? String(description).trim() : null,
      primary_category: structured.primary_category,
      sub_category: structured.sub_category || null,
      seo_tags: structured.seo_tags || [],
      sustainability_filters: structured.sustainability_filters || [],
      raw_ai_json: { structured, raw },
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(err.message?.includes('OPENAI') ? 503 : 422).json({
      error: err.message || 'Category/tag generation failed',
    });
  }
});

/** GET /api/category-tag/products - List products */
router.get('/products', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const list = await ProductCatalog.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list products' });
  }
});

/** GET /api/category-tag/products/:id - Get one product */
router.get('/products/:id', async (req, res) => {
  try {
    const doc = await ProductCatalog.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Product not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

export default router;
