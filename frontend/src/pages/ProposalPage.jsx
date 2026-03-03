import { useState } from 'react';
import { api } from '../api/client';

export default function ProposalPage() {
  const [budgetLimit, setBudgetLimit] = useState('');
  const [clientName, setClientName] = useState('');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    const budget = parseFloat(budgetLimit);
    if (!Number.isFinite(budget) || budget <= 0) {
      setError('Budget limit must be a positive number');
      return;
    }
    setLoading(true);
    try {
      const data = await api.proposal.generate({
        budget_limit: budget,
        client_name: clientName.trim() || undefined,
        preferences: preferences.trim() || undefined,
      });
      setResult(data);
      setBudgetLimit('');
      setClientName('');
      setPreferences('');
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <h2>Module 2: AI B2B Proposal Generator</h2>
      <p className="muted">
        Generate a structured proposal with sustainable product mix, budget allocation, cost breakdown, and a client-ready
        impact summary.
      </p>

      <div className="layout-two-column">
        <form onSubmit={handleSubmit} className="card form">
          <label>
            Budget limit <span className="required">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="any"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            placeholder="e.g. 5000"
            disabled={loading}
          />
          <label>Client name (optional)</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Company or contact name"
            disabled={loading}
          />
          <label>Preferences (optional)</label>
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="e.g. focus on plastic-free, local sourcing"
            rows={2}
            disabled={loading}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Generating…' : 'Generate & Store'}
          </button>
        </form>

        <div className="card result">
          <h3>Proposal snapshot</h3>
          {result ? (
            <dl className="result-dl">
              <dt>Impact summary</dt>
              <dd className="impact-summary">{result.impact_positioning_summary || '—'}</dd>
              <dt>Cost breakdown</dt>
              <dd>
                <pre className="pre">{JSON.stringify(result.cost_breakdown || {}, null, 2)}</pre>
              </dd>
              <dt>Product mix</dt>
              <dd>
                <ul className="product-mix">
                  {(result.suggested_product_mix || []).map((item, i) => (
                    <li key={i}>
                      {item.product_name} × {item.quantity} @ {item.unit_price} — {item.sustainability_notes || ''}
                    </li>
                  ))}
                </ul>
              </dd>
              <dt>Budget allocation</dt>
              <dd>
                <ul className="allocation">
                  {(result.budget_allocation || []).map((a, i) => (
                    <li key={i}>{a.category}: {a.amount} ({a.percentage}%)</li>
                  ))}
                </ul>
              </dd>
            </dl>
          ) : (
            <p className="muted">
              Run a generation to preview your AI-created proposal: we will keep a full JSON record alongside this
              human-readable summary.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
