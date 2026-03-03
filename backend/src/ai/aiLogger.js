import { AiLog } from '../models/AiLog.js';

/** Prompt + response logging for all AI calls. */
export async function logAiCall({
  module,
  prompt_text = null,
  response_text = null,
  request_metadata = null,
  response_metadata = null,
  success = true,
  error_message = null,
}) {
  await AiLog.create({
    module,
    prompt_text,
    response_text,
    request_metadata,
    response_metadata,
    success: success ? 1 : 0,
    error_message,
  });
}
