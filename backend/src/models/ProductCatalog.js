import mongoose from 'mongoose';

const productCatalogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    primary_category: { type: String },
    sub_category: { type: String },
    seo_tags: [{ type: String }],
    sustainability_filters: [{ type: String }],
    raw_ai_json: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const ProductCatalog = mongoose.model('ProductCatalog', productCatalogSchema);
