export type Product = {
  id: number;
  slug: string;
  title: string;
  description: string;
  platform: string;
  coverColor: string;
  coverImageUrl: string;
  minPriceCents: number;
  currency: string;
  offerCount: number;
};
export type Homepage = {
  hero: {eyebrow: string; title: string; subtitle: string; buttonText: string; buttonHref: string; imageUrl: string; theme: string};
  categories: Array<{name: string; icon: string; href: string}>;
  sections: Array<{title: string; subtitle: string; products: Product[]}>;
};
// Local development uses the Vite /api proxy to avoid browser CORS restrictions.
// Set VITE_API_URL only when calling a separately hosted API (e.g. in production).
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
async function fromApi<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {signal});
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  const json: {data: T} = await response.json();
  return json.data;
}
export const fetchHomepage = (signal?: AbortSignal) => fromApi<Homepage>('/api/v1/home', signal);
export function fetchProducts(filters: {q: string; platform: string; sort: string}, signal?: AbortSignal): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.platform) params.set('platform', filters.platform);
  if (filters.sort) params.set('sort', filters.sort);
  return fromApi<Product[]>(`/api/v1/products?${params}`, signal);
}
