import { useState } from 'react';
import { api } from '../api/client';

export default function CategoryTagPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }
    setLoading(true);
    try {
      const data = await api.categoryTag.generate({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setResult(data);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <h2>Module 1: AI Auto-Category & Tag Generator</h2>
      <p className="muted">
        Auto-assign a primary category, sub-category, 5–10 SEO tags, and sustainability filters for any product in your
        catalog.
      </p>

      <div className="layout-two-column">
        <form onSubmit={handleSubmit} className="card form">
          <label>
            Product name <span className="required">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bamboo Toothbrush Set"
            maxLength={512}
            disabled={loading}
          />
          <label>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short product description..."
            rows={3}
            disabled={loading}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Generating…' : 'Generate & Store'}
          </button>
        </form>

        <div className="card result">
          <h3>Preview</h3>
          {result ? (
            <dl className="result-dl">
              <dt>Primary category</dt>
              <dd>{result.primary_category}</dd>
              <dt>Sub-category</dt>
              <dd>{result.sub_category || '—'}</dd>
              <dt>SEO tags (5–10)</dt>
              <dd>
                <ul className="tags">
                  {(result.seo_tags || []).map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </dd>
              <dt>Sustainability filters</dt>
              <dd>
                <ul className="tags sustainability">
                  {(result.sustainability_filters || []).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </dd>
            </dl>
          ) : (
            <p className="muted">
              Run a generation to see AI-suggested categories, SEO tags, and sustainability filters for your product.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
