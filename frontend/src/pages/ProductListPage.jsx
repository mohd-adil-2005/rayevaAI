import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function ProductListPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.categoryTag
      .listProducts()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <section className="page"><p>Loading products…</p></section>;
  if (error) return <section className="page"><p className="error">{error}</p></section>;

  return (
    <section className="page">
      <h2>Products (Module 1)</h2>
      <p className="muted">Catalog entries with AI-generated category, tags, and sustainability filters.</p>
      <div className="list">
        {list.length === 0 ? (
          <p className="muted">No products yet. Add one from Category & Tags.</p>
        ) : (
          list.map((p) => (
            <div key={p._id} className="card list-item">
              <h4>{p.name}</h4>
              {p.description && <p className="muted">{p.description}</p>}
              <p><strong>Category:</strong> {p.primary_category} {p.sub_category && ` → ${p.sub_category}`}</p>
              <p><strong>SEO tags:</strong> {(p.seo_tags || []).join(', ')}</p>
              <p><strong>Sustainability:</strong> {(p.sustainability_filters || []).join(', ') || '—'}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
