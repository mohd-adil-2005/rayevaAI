# Rayeva AI – Sustainable Commerce (MERN)

Fullstack MERN implementation of the Rayeva AI Systems Assignment: **Module 1** (AI Auto-Category & Tag Generator) and **Module 2** (AI B2B Proposal Generator) fully implemented; **Module 3** and **Module 4** architecture outlined below.

## Tech Stack

- **M**ongoDB – catalog, proposals, AI logs
- **E**xpress – REST API, env-based config, error handling
- **R**eact – Vite app, Category/Tag and Proposal UIs
- **N**ode.js – backend runtime

AI: OpenAI API (gpt-4o-mini) with prompt/response logging, structured JSON outputs, and clear separation between AI and business logic.

## Quick Start

1. **Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Set OPENAI_API_KEY and MONGODB_URI in .env
   npm install
   npm run dev
   ```
   Server runs at `http://localhost:5000`.

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App runs at `http://localhost:3000` (proxies `/api` to backend).

3. **MongoDB**  
   Ensure MongoDB is running locally (or set `MONGODB_URI` to your Atlas URI).

## Project Structure

```
rayevaAI/
├── backend/
│   ├── src/
│   │   ├── config.js          # Env-based config
│   │   ├── index.js           # Express app, CORS, routes
│   │   ├── db/connection.js   # Mongoose connect
│   │   ├── models/            # ProductCatalog, Proposal, AiLog
│   │   ├── ai/                # OpenAI client, logger, categoryTagAi, proposalAi
│   │   └── routes/            # categoryTag.js, proposal.js
│   └── .env.example
├── frontend/
│   └── src/
│       ├── App.jsx, main.jsx, index.css, App.css
│       ├── api/client.js      # API helpers
│       └── pages/             # CategoryTag, Proposal, ProductList, ProposalList
└── README.md
```

## API (Backend)

- `POST /api/category-tag/generate` – body: `{ name, description? }` → create product with AI category, sub-category, 5–10 SEO tags, sustainability filters; stored in MongoDB.
- `GET /api/category-tag/products` – list products (optional `?limit=50`).
- `GET /api/category-tag/products/:id` – get one product.
- `POST /api/proposal/generate` – body: `{ budget_limit, client_name?, preferences? }` → create B2B proposal (product mix, budget allocation, cost breakdown, impact summary); stored in MongoDB.
- `GET /api/proposal` – list proposals.
- `GET /api/proposal/:id` – get one proposal.

## Technical Requirements (Assignment)

- **Structured JSON outputs** – Both modules return and store structured JSON (category/tags and proposal fields).
- **Prompt + response logging** – Every AI call is logged in `AiLog` (module, prompt_text, response_text, metadata, success, error_message).
- **Environment-based API key** – `OPENAI_API_KEY` and `MONGODB_URI` in `.env`; no secrets in code.
- **Separation of AI and business logic** – `backend/src/ai/` holds only LLM calls and parsing; routes and models handle validation and DB.
- **Error handling and validation** – Input validation in routes; try/catch and appropriate HTTP status codes; AI errors logged and surfaced to client.

## AI Prompt Design

- **Module 1 (Category & Tags):** System prompt defines the exact list of primary categories and instructs the model to return one category, one sub-category, 5–10 SEO tags, and applicable sustainability filters. Response is parsed as JSON and validated (e.g. category fallback to "Other" if not in list).
- **Module 2 (Proposal):** System prompt defines the required JSON shape (suggested_product_mix, budget_allocation, cost_breakdown, impact_positioning_summary) and constraints (total ≤ budget, percentages sum to 100). Response is parsed and stored as-is for audit.

## Architecture Outline: Module 3 (AI Impact Reporting Generator)

- **Purpose:** Per order, estimate plastic saved, carbon avoided, local sourcing impact; store a human-readable impact statement with the order.
- **Data:** Orders collection (or extend existing) with line items, quantities, product refs; product catalog already has sustainability_filters and can be extended with optional `plastic_equiv_grams`, `carbon_kg_co2e`, `local_sourced` flags or lookup table.
- **AI/Logic:** 
  - Plastic saved: sum over line items of (quantity × product.plastic_equiv_grams) or use AI to estimate from product name/description if no field.
  - Carbon avoided: same idea with `carbon_kg_co2e` or heuristic (e.g. local vs imported).
  - Local sourcing: count or highlight items marked local; optional AI summary sentence.
  - One AI call (or template + logic) to produce a short human-readable impact statement; store it on the order document.
- **API:** e.g. `POST /api/orders` (create order) triggers impact computation and statement generation; `GET /api/orders/:id` returns order with `impact_statement` and breakdown (plastic_saved, carbon_avoided, local_summary).
- **Frontend:** Order detail page showing impact statement and metrics.

## Architecture Outline: Module 4 (AI WhatsApp Support Bot)

- **Purpose:** Answer order status from DB, return policy questions, escalate refunds/high-priority, log all AI conversations.
- **Stack:** WhatsApp Business API (or Twilio/other provider) for receiving/sending messages; Node worker or webhook endpoint to process incoming messages.
- **Flow:**
  1. Incoming message → identify intent (order status, return policy, refund/escalation).
  2. Order status: query MongoDB for order by ID or phone/email; return status and tracking if available.
  3. Return policy: use a small knowledge snippet or one AI call with fixed context; respond with policy text.
  4. Refund / high-priority: flag for human; optionally notify internal tool; respond with “We’ve escalated your request.”
  5. Log every conversation (user message, bot response, intent, order_id if any) in a `ConversationLog` collection with timestamp.
- **AI:** One LLM call for intent classification + optional response generation for policy Q&A; order status and escalation are business logic (DB + rules). Keep prompts short and response format structured (e.g. JSON with intent and suggested reply).
- **Security:** Validate webhook signature; never expose internal DB or API keys to client; store only necessary PII in logs.

## Submission Checklist

- [x] GitHub repository (you can push this folder).
- [x] README with architecture overview and AI prompt design.
- [ ] 3–5 minute demo video (record locally and upload).
