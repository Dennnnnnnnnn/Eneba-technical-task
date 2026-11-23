export type Product = {
  id: number; slug: string; title: string; description: string; platform: string;
  coverColor: string; coverImageUrl: string; minPriceCents: number; currency: string; offerCount: number;
};
export type Offer = {id:number; sellerId:number; sellerName:string; region:string; priceCents:number; currency:string};
export type ProductPage = {items: Product[]; total:number; page:number; pageSize:number; totalPages:number};
export type Filters = {q:string;platform:string;region:string;sort:string;minPriceCents?:number;maxPriceCents?:number;page:number;pageSize:number};
export type Homepage = {
  hero: {eyebrow:string;title:string;subtitle:string;buttonText:string;buttonHref:string;imageUrl:string;theme:string};
  categories: Array<{name:string;icon:string;href:string}>;
  sections: Array<{title:string;subtitle:string;products:Product[]}>;
};
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
async function fromApi<T>(path:string,signal?:AbortSignal):Promise<T>{
  const response=await fetch(`${apiBase}${path}`,{signal});
  if(!response.ok){const body=await response.json().catch(()=>({}));throw new Error(body.error || `API request failed (${response.status})`)}
  const json:{data:T}=await response.json();return json.data;
}
export const fetchHomepage=(signal?:AbortSignal)=>fromApi<Homepage>('/api/v1/home',signal);
export function fetchProducts(filters:Filters,signal?:AbortSignal){
  const params=new URLSearchParams();
  for (const [key,val] of Object.entries(filters)){if(val!==''&&val!==undefined)params.set(key,String(val));}
  return fromApi<ProductPage>(`/api/v1/products?${params}`,signal);
}
export const fetchProduct=(slug:string,signal?:AbortSignal)=>fromApi<Product>(`/api/v1/products/${encodeURIComponent(slug)}`,signal);
export const fetchOffers=(slug:string,signal?:AbortSignal)=>fromApi<Offer[]>(`/api/v1/products/${encodeURIComponent(slug)}/offers`,signal);
