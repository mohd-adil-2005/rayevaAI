/** Module 1: AI Auto-Category & Tag Generator. AI layer only. */
import { getOpenAIClient } from './openaiClient.js';
import { logAiCall } from './aiLogger.js';
import { config } from '../config.js';

const MODULE = 'category_tag';
const PRIMARY_CATEGORIES = [
  'Food & Beverage', 'Personal Care', 'Home & Cleaning', 'Packaging',
  'Office & Stationery', 'Fashion & Textiles', 'Electronics & Tech',
  'Agriculture & Garden', 'Other',
];

const SYSTEM_PROMPT = `You are a catalog assistant for a sustainable commerce platform.
Given a product name and optional description:
1. Assign exactly ONE primary category from this list (no other values): ${PRIMARY_CATEGORIES.map(c => `"${c}"`).join(', ')}
2. Suggest one sub-category (short, specific).
3. Generate exactly 5 to 10 SEO tags (lowercase, hyphenated or single words).
4. Suggest sustainability filters that apply: plastic-free, compostable, vegan, recycled, biodegradable, reusable, fair-trade, organic, local, cruelty-free. Only include filters that clearly apply.

Respond with a single JSON object only, no markdown, no explanation:
{"primary_category": "<from list>", "sub_category": "<string>", "seo_tags": ["tag1", "tag2", ...], "sustainability_filters": ["filter1", ...]}`;

function parseJson(raw) {
  let text = (raw || '').trim();
  if (text.startsWith('```')) {
    const lines = text.split('\n');
    if (lines[0].startsWith('```')) lines.shift();
    if (lines.length && lines[lines.length - 1].trim() === '```') lines.pop();
    text = lines.join('\n');
  }
  return JSON.parse(text);
}

function validateOutput(data) {
  if (!data.primary_category || typeof data.primary_category !== 'string')
    throw new Error('Missing or invalid primary_category');
  if (!Array.isArray(data.seo_tags) || data.seo_tags.length < 5 || data.seo_tags.length > 10)
    throw new Error('seo_tags must be an array of 5-10 strings');
  if (!Array.isArray(data.sustainability_filters))
    data.sustainability_filters = [];
  const cat = data.primary_category;
  if (!PRIMARY_CATEGORIES.includes(cat)) data.primary_category = 'Other';
  return data;
}

export async function generateCategoryAndTags(name, description) {
  // Optional mock mode so the app works even without external LLM quota.
  if (config.useMockAi) {
    const structured = validateOutput({
      primary_category: 'Home & Cleaning',
      sub_category: 'Sample sub-category',
      seo_tags: ['bamboo', 'eco-friendly', 'sample-tag', 'demo-product', 'sustainable'],
      sustainability_filters: ['plastic-free', 'reusable'],
    });
    const raw = JSON.stringify(structured, null, 2);
    await logAiCall({
      module: MODULE,
      prompt_text: '[MOCK] ' + name,
      response_text: raw,
      request_metadata: { mock: true },
      response_metadata: { source: 'mock' },
      success: true,
    });
    return { structured, raw };
  }

  const client = getOpenAIClient();
  const userContent = description
    ? `Product name: ${name}\nDescription: ${description}`
    : `Product name: ${name}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gemini-2.5-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.2,
    });

    const raw = (response.choices[0]?.message?.content || '').trim();
    await logAiCall({
      module: MODULE,
      prompt_text: userContent,
      response_text: raw,
      request_metadata: { name, has_description: !!description },
      response_metadata: { model: response.model },
      success: true,
    });

    const data = parseJson(raw);
    const validated = validateOutput(data);
    return { structured: validated, raw };
  } catch (err) {
    await logAiCall({
      module: MODULE,
      prompt_text: userContent,
      success: false,
      error_message: err.message,
    });
    throw err;
  }
}
