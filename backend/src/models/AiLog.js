import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema(
  {
    module: { type: String, required: true },
    prompt_text: { type: String },
    response_text: { type: String },
    request_metadata: { type: mongoose.Schema.Types.Mixed },
    response_metadata: { type: mongoose.Schema.Types.Mixed },
    success: { type: Number, default: 1 },
    error_message: { type: String },
  },
  { timestamps: true }
);

export const AiLog = mongoose.model('AiLog', aiLogSchema);
