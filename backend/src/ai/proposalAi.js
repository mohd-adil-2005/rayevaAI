/** Module 2: AI B2B Proposal Generator. AI layer only. */
import { getOpenAIClient } from './openaiClient.js';
import { logAiCall } from './aiLogger.js';
import { config } from '../config.js';

const MODULE = 'proposal';

const SYSTEM_PROMPT = `You are a B2B sales assistant for a sustainable commerce platform.
Given a budget limit (in currency units) and optional client preferences:
1. Suggest a sustainable product mix: list of products with product_name, quantity, unit_price, sustainability_notes. Total must not exceed the budget.
2. Budget allocation: break down by category (e.g. "Packaging", "Personal Care") with amount and percentage. Percentages should sum to 100.
3. Cost breakdown: object with subtotal, tax (if applicable), total. total must equal the given budget_limit.
4. Impact positioning summary: 2-4 sentences on environmental/social impact.

Respond with a single JSON object only, no markdown:
{
  "suggested_product_mix": [{"product_name": "...", "quantity": 1, "unit_price": 0.0, "sustainability_notes": "..."}],
  "budget_allocation": [{"category": "...", "amount": 0.0, "percentage": 0.0}],
  "cost_breakdown": {"subtotal": 0.0, "tax": 0.0, "total": 0.0},
  "impact_positioning_summary": "..."
}`;

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

export async function generateProposal(budgetLimit, clientName, preferences) {
  // Optional mock mode so the app works even without OpenAI quota.
  if (config.useMockAi) {
    const structured = {
      suggested_product_mix: [
        {
          product_name: 'Sample reusable bottle',
          quantity: 100,
          unit_price: +(budgetLimit / 200).toFixed(2),
          sustainability_notes: 'Reusable and BPA-free.',
        },
      ],
      budget_allocation: [
        { category: 'Packaging', amount: +(budgetLimit * 0.4).toFixed(2), percentage: 40 },
        { category: 'Gifting', amount: +(budgetLimit * 0.6).toFixed(2), percentage: 60 },
      ],
      cost_breakdown: {
        subtotal: +(budgetLimit * 0.9).toFixed(2),
        tax: +(budgetLimit * 0.1).toFixed(2),
        total: budgetLimit,
      },
      impact_positioning_summary:
        'This is a mock proposal to let you demo the UI without consuming real OpenAI quota.',
    };
    const raw = JSON.stringify(structured, null, 2);
    await logAiCall({
      module: MODULE,
      prompt_text: '[MOCK] ' + budgetLimit,
      response_text: raw,
      request_metadata: { mock: true },
      response_metadata: { source: 'mock' },
      success: true,
    });
    return { structured, raw };
  }

  const client = getOpenAIClient();
  let userContent = `Budget limit: ${budgetLimit}`;
  if (clientName) userContent += `\nClient: ${clientName}`;
  if (preferences) userContent += `\nPreferences: ${preferences}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gemini-2.5-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
    });

    const raw = (response.choices[0]?.message?.content || '').trim();
    await logAiCall({
      module: MODULE,
      prompt_text: userContent,
      response_text: raw,
      request_metadata: { budget_limit: budgetLimit, client_name: clientName },
      response_metadata: { model: response.model },
      success: true,
    });

    const data = parseJson(raw);
    if (!data.suggested_product_mix) data.suggested_product_mix = [];
    if (!data.budget_allocation) data.budget_allocation = [];
    if (!data.cost_breakdown) data.cost_breakdown = {};
    if (!data.impact_positioning_summary) data.impact_positioning_summary = '';
    return { structured: data, raw };
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
