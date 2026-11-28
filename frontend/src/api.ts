export type Product = {
  id: number; slug: string; title: string; description: string; platform: string;
  coverColor: string; coverImageUrl: string; minPriceCents: number; currency: string; offerCount: number; region: string; cashbackPercent: number;
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
  const json:unknown=await response.json();
  if (!json || typeof json !== 'object' || !('data' in json)) {
    throw new Error(`Unexpected API response from ${path}: missing data field. Check that the Go backend is running on port 8080.`);
  }
  return (json as {data:T}).data;
}
export const fetchHomepage=(signal?:AbortSignal)=>fromApi<Homepage>('/api/v1/home',signal);
export function fetchProducts(filters:Filters,signal?:AbortSignal){
  const params=new URLSearchParams();
  for (const [key,val] of Object.entries(filters)){if(val!==''&&val!==undefined)params.set(key,String(val));}
  return fromApi<ProductPage>(`/api/v1/products?${params}`,signal).then(page => {
    if (!page || !Array.isArray(page.items)) {
      throw new Error('Unexpected catalog response: data.items must be an array. Check GET /api/v1/products in the browser Network tab.');
    }
    return page;
  });
}
export const fetchProduct=(slug:string,signal?:AbortSignal)=>fromApi<Product>(`/api/v1/products/${encodeURIComponent(slug)}`,signal);
export const fetchOffers=(slug:string,signal?:AbortSignal)=>fromApi<Offer[]>(`/api/v1/products/${encodeURIComponent(slug)}/offers`,signal);
export type FavoriteSummary={count:number;saved:boolean};
export const getFavorites=(slug:string,signal?:AbortSignal)=>fromApi<FavoriteSummary>(`/api/v1/products/${encodeURIComponent(slug)}/favorites`,signal);
export const setFavorite=(slug:string,saved:boolean)=>request<FavoriteSummary>(`/api/v1/products/${encodeURIComponent(slug)}/favorites`,{method:saved?'POST':'DELETE'});


export type Account = {id:number;email:string};
export type CartItem = {offerId:number;slug:string;title:string;platform:string;coverImageUrl:string;seller:string;region:string;priceCents:number;currency:string;available:boolean;cashbackPercent:number};
export type Cart = {items:CartItem[];totalCents:number;currency:string};
export type OrderItem = {id:number;title:string;seller:string;platform:string;region:string;priceCents:number;currency:string;key:string};
export type Order = {id:number;status:string;totalCents:number;currency:string;createdAt:string;items?:OrderItem[]};
async function request<T>(path:string,options:RequestInit={}) : Promise<T> {
 const response=await fetch(`${apiBase}${path}`,{...options,credentials:'include',headers:{'Content-Type':'application/json',...options.headers}});
 const body=await response.json().catch(()=>({}));
 if (!response.ok) throw new Error(body.error||`Request failed (${response.status})`);
 return body.data as T;
}
export const currentAccount=()=>request<Account>('/api/v1/auth/me');
export const register=(email:string,password:string)=>request<Account>('/api/v1/auth/register',{method:'POST',body:JSON.stringify({email,password})});
export const login=(email:string,password:string)=>request<Account>('/api/v1/auth/login',{method:'POST',body:JSON.stringify({email,password})});
export const logout=()=>request<{ok:boolean}>('/api/v1/auth/logout',{method:'POST'});
export const getCart=()=>request<Cart>('/api/v1/cart');
export const addCartItem=(offerId:number)=>request<Cart>('/api/v1/cart/items',{method:'POST',body:JSON.stringify({offerId})});
export const removeCartItem=(offerId:number)=>request<Cart>(`/api/v1/cart/items/${offerId}`,{method:'DELETE'});
export const checkout=(idempotencyKey:string)=>request<Order>('/api/v1/checkout',{method:'POST',body:JSON.stringify({idempotencyKey})});
export const getOrders=()=>request<Order[]>('/api/v1/orders');
export const getOrder=(id:number)=>request<Order>(`/api/v1/orders/${id}`);

export type HomeBanner = {id:number;title:string;eyebrow:string;subtitle:string;cta:string;href:string;imageUrl:string;theme:string};
export type HomeCategory = {name:string;icon:string;href:string};
export type HomeGenre = {id:number;name:string;icon:string;count:number};
export type HomeSectionMeta = {id:number;title:string;subtitle:string};
export type HomeSection = HomeSectionMeta & {products:Product[]};
export const fetchHomeBanners=(signal?:AbortSignal)=>fromApi<HomeBanner[]>('/api/v1/home/banners',signal);
export const fetchHomeCategories=(signal?:AbortSignal)=>fromApi<HomeCategory[]>('/api/v1/home/categories',signal);
export const fetchHomeGenres=(signal?:AbortSignal)=>fromApi<HomeGenre[]>('/api/v1/home/genres',signal);
export const fetchHomeSectionList=(signal?:AbortSignal)=>fromApi<HomeSectionMeta[]>('/api/v1/home/sections',signal);
export const fetchHomeSection=(id:number,signal?:AbortSignal)=>fromApi<HomeSection>(`/api/v1/home/sections/${id}`,signal);
