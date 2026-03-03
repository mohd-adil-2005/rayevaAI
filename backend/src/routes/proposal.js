import express from 'express';
import { Proposal } from '../models/Proposal.js';
import { generateProposal } from '../ai/proposalAi.js';

const router = express.Router();

/** POST /api/proposal/generate - Generate and store in DB */
router.post('/generate', async (req, res) => {
  try {
    const { budget_limit, client_name, preferences } = req.body || {};
    const budget = Number(budget_limit);
    if (!Number.isFinite(budget) || budget <= 0) {
      return res.status(400).json({ error: 'budget_limit is required (positive number)' });
    }
    const { structured, raw } = await generateProposal(
      budget,
      client_name ? String(client_name).trim() : null,
      preferences ? String(preferences).trim() : null
    );
    const doc = await Proposal.create({
      client_name: client_name ? String(client_name).trim() : null,
      budget_limit: budget,
      suggested_product_mix: structured.suggested_product_mix || [],
      budget_allocation: structured.budget_allocation || [],
      cost_breakdown: structured.cost_breakdown || {},
      impact_positioning_summary: structured.impact_positioning_summary || '',
      raw_ai_json: { structured, raw },
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(err.message?.includes('OPENAI') ? 503 : 422).json({
      error: err.message || 'Proposal generation failed',
    });
  }
});

/** GET /api/proposal - List proposals */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const list = await Proposal.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list proposals' });
  }
});

/** GET /api/proposal/:id - Get one proposal */
router.get('/:id', async (req, res) => {
  try {
    const doc = await Proposal.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Proposal not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get proposal' });
  }
});

export default router;
