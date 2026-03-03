import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema(
  {
    client_name: { type: String },
    budget_limit: { type: Number },
    suggested_product_mix: [{ type: mongoose.Schema.Types.Mixed }],
    budget_allocation: [{ type: mongoose.Schema.Types.Mixed }],
    cost_breakdown: { type: mongoose.Schema.Types.Mixed },
    impact_positioning_summary: { type: String },
    raw_ai_json: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Proposal = mongoose.model('Proposal', proposalSchema);
