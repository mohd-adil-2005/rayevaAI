const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || 'Request failed');
  return data;
}

export const api = {
  categoryTag: {
    generate: (body) => request('/category-tag/generate', { method: 'POST', body: JSON.stringify(body) }),
    listProducts: (limit = 50) => request(`/category-tag/products?limit=${limit}`),
    getProduct: (id) => request(`/category-tag/products/${id}`),
  },
  proposal: {
    generate: (body) => request('/proposal/generate', { method: 'POST', body: JSON.stringify(body) }),
    list: (limit = 50) => request(`/proposal?limit=${limit}`),
    get: (id) => request(`/proposal/${id}`),
  },
};
