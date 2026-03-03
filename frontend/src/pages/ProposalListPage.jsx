import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function ProposalListPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.proposal
      .list()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <section className="page"><p>Loading proposals…</p></section>;
  if (error) return <section className="page"><p className="error">{error}</p></section>;

  return (
    <section className="page">
      <h2>Proposals (Module 2)</h2>
      <p className="muted">B2B proposals with product mix, budget allocation, and impact summary.</p>
      <div className="list">
        {list.length === 0 ? (
          <p className="muted">No proposals yet. Create one from Proposal.</p>
        ) : (
          list.map((p) => (
            <div key={p._id} className="card list-item">
              <h4>{p.client_name || 'Unnamed client'} — Budget: {p.budget_limit}</h4>
              <p className="impact-preview">{p.impact_positioning_summary || '—'}</p>
              <p><strong>Cost breakdown:</strong> {JSON.stringify(p.cost_breakdown || {})}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
