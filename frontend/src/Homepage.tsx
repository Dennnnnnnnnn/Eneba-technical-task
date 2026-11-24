import {HeartIcon} from './UiIcons';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {fetchHomeBanners,fetchHomeCategories,fetchHomeGenres,fetchHomeSectionList,fetchHomeSection,fetchProduct,type HomeBanner,type HomeCategory,type HomeGenre,type HomeSection,type HomeSectionMeta,type Product} from './api';

const shortcutPaths:Record<string,ReactNode>={
 gamepad:<><rect x="3" y="9" width="26" height="16" rx="6"/><path d="M10 13v8m-4-4h8m9-3h.01M26 19h.01M12 9V5m0 0 3-2"/></>,
 gift:<><rect x="4" y="11" width="24" height="17" rx="2"/><path d="M4 16h24M16 11v17M16 11c-9 0-10-9-4-9 4 0 4 6 4 9Zm0 0c9 0 10-9 4-9-4 0-4 6-4 9Z"/></>,
 card:<><rect x="3" y="6" width="26" height="20" rx="3"/><path d="M3 13h26m-21 8h8"/></>,
 wallet:<><rect x="4" y="9" width="24" height="18" rx="3"/><path d="M5 9V6a2 2 0 0 1 2-2h17m4 12h-8a3 3 0 0 0 0 6h8M22 19h.01"/></>,
 steam:<><circle cx="16" cy="16" r="12"/><circle cx="21" cy="11" r="4"/><circle cx="9" cy="23" r="3"/><path d="m12 21 6-7"/></>,
 playstation:<><path d="M13 3 23 7v18l-6 3V10l-4-1V3Zm-3 19c-6 1-9 4-4 5 4 2 13-1 22-5-3-2-6-2-9-1"/></>,
 xbox:<><circle cx="16" cy="16" r="12"/><path d="M7 7c6 1 13 10 18 17M25 7C18 8 10 19 7 24"/></>,
 switch:<><rect x="7" y="3" width="18" height="26" rx="5"/><path d="M16 3v26M12 10h.01M20 22h.01"/></>,
 tag:<><path d="M4 4h12l12 12-12 12L4 16V4Z"/><circle cx="11" cy="11" r="2"/></>,
 music:<><path d="M12 24V7l14-3v17M12 11l14-3"/><ellipse cx="8" cy="24" rx="4" ry="3"/><ellipse cx="22" cy="21" rx="4" ry="3"/></>,
 video:<><rect x="4" y="7" width="24" height="18" rx="3"/><path d="m14 12 8 4-8 4v-8Z"/></>,
 calendar:<><rect x="4" y="7" width="24" height="22" rx="2"/><path d="M10 3v8m12-8v8M4 14h24"/></>
};
const shortcutIconFiles:Record<string,string>={
 'Games':'games',
 'Gaming eCards':'gaming-ecards',
 'eGift Cards':'egift-cards',
 'E-money':'e-money',
 'Steam':'steam',
 'Steam Gift Cards':'steam-gift-cards',
 'PSN':'psn',
 'Xbox':'xbox',
 'FIFA':'fifa',
 'Fortnite':'fortnite',
 'Amazon':'amazon',
 'Apple':'apple',
 'Mobile games':'mobile-games',
 'Spotify':'spotify',
 'Netflix':'netflix',
 'Nintendo':'nintendo',
 'DLCs':'dlcs',
 'Pre-orders':'pre-orders',
 'Cheap games':'cheap-games'
};
function ShortcutIcon({name,label}:{name:string;label:string}){
 const file=shortcutIconFiles[label];
 return file?<img className="shortcut-svg" src={`/shortcut-icons/${file}.svg`} alt="" loading="lazy"/>:<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{shortcutPaths[name]??shortcutPaths.gamepad}</svg>;
}
const money=(cents:number,currency='EUR')=>new Intl.NumberFormat('en-IE',{style:'currency',currency}).format(cents/100);
export function Card({product,onOpen,onAdd,onWish}:{product:Product;onOpen:(slug:string)=>void;onAdd:(p:Product)=>void;onWish:(p:Product)=>void}){
 const [failed,setFailed]=useState(false);
 const platform=product.platform==='PC'?'Steam':product.platform==='Xbox'?'Xbox Live':product.platform==='Switch'?'Nintendo':product.platform==='Gift Card'?(product.title.toLowerCase().includes('roblox')?'Roblox':'Gift Card'):product.platform==='Windows'?'Windows Store':product.platform==='PlayStation'?'PSN':product.platform;
 const region=product.region==='EU'?'EUROPE':product.region==='US'?'UNITED STATES':product.region;
 const cashback=Math.round(product.minPriceCents*(product.cashbackPercent??0)/100);
 return <article className="eneba-card">
  <div className="eneba-art" style={{background:product.coverColor}}>
   <button type="button" className="eneba-cover-link" onClick={()=>onOpen(product.slug)} aria-label={`View ${product.title}`}>
    {product.coverImageUrl&&!failed?<img src={product.coverImageUrl} alt={`${product.title} cover`} loading="lazy" onError={()=>setFailed(true)}/>:<div className="eneba-fallback">{product.title}</div>}
   </button>
   <button type="button" className="eneba-wish" aria-label={`Save ${product.title} to wishlist`} onClick={()=>onWish(product)}><HeartIcon width={23} height={23}/></button>
   {cashback>0&&<span className="cashback-badge">⊕ &nbsp;CASHBACK</span>}
  </div>
  <div className="eneba-card-copy">
   <div className="eneba-platform"><PlatformMark platform={platform}/> {platform}</div>
   <button className="eneba-title" onClick={()=>onOpen(product.slug)} title={product.title}>{product.title} ({product.platform}) Key</button>
   <div className={`eneba-region ${['GLOBAL','EUROPE','FRANCE'].includes(region)?'region-green':'region-pink'}`}>{region}</div>
   <span className="eneba-from">From</span>
   <div className="eneba-price">{money(product.minPriceCents,product.currency)} <span className="round-info" title="Price from the cheapest seller">i</span></div>
   <div className="eneba-cashback">{cashback>0?`Cashback: ${money(cashback,product.currency)}`:'Demo digital key'}</div>
   <div className="eneba-card-actions"><button type="button" className="card-add" onClick={()=>onAdd(product)}>Add to cart</button><button type="button" className="card-offers" onClick={()=>onOpen(product.slug)}>View offers</button></div>
  </div>
 </article>
}
function PlatformMark({platform}:{platform:string}){
 const kind=platform.toLowerCase();
 if(kind.includes('xbox'))return <svg className="platform-logo" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="currentColor"/><path d="M7 7c5 2 8 5 9 7 1-2 4-5 9-7M6 25c1-5 5-10 10-13 5 3 9 8 10 13" stroke="#161326" strokeWidth="2.8" fill="none"/></svg>;
 if(kind.includes('steam')||kind==='pc')return <svg className="platform-logo" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/><circle cx="21" cy="11" r="4" stroke="currentColor" strokeWidth="2"/><path d="M5 19 13 23 19 15" stroke="currentColor" strokeWidth="2.5"/><circle cx="11" cy="23" r="3" fill="currentColor"/></svg>;
 if(kind.includes('psn')||kind.includes('playstation')||kind.includes('ps5'))return <svg className="platform-logo" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M14 2c8 1 12 4 12 10 0 4-3 5-7 4V8c0-1-1-2-2-2v23l-5-2V2h2Zm-4 16v6l-8-2v-3l8-3Zm9 2 11-4v5l-11 4v-5Z"/></svg>;
 if(kind.includes('roblox'))return <svg className="platform-logo" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9 2 30 9 23 30 2 23 9 2Zm6 9-4 6 6 4 4-6-6-4Z"/></svg>;
 if(kind.includes('windows')||kind.includes('store'))return <svg className="platform-logo" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M2 5 15 3v12H2V5Zm16-2 12-2v14H18V3ZM2 18h13v12L2 28V18Zm16 0h12v14l-12-2V18Z"/></svg>;
 return <svg className="platform-logo" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="4" y="4" width="24" height="24" rx="5" stroke="currentColor" strokeWidth="2"/><path d="M16 6v20" stroke="currentColor" strokeWidth="2"/></svg>
}
function GiftCardTile({product,onOpen}:{product:Product;onOpen:(slug:string)=>void}){
 const [failed,setFailed]=useState(false);
 return <button className="egift-tile" type="button" onClick={()=>onOpen(product.slug)} aria-label={`View ${product.title}`} style={{backgroundColor:product.coverColor}}>{product.coverImageUrl&&!failed?<img src={product.coverImageUrl} alt={product.title} loading="lazy" onError={()=>setFailed(true)}/>:<strong>{product.title}</strong>}</button>;
}
function Shelf({meta,onOpen,onAdd,onWish,onAll}:{meta:HomeSectionMeta;onOpen:(s:string)=>void;onAdd:(p:Product)=>void;onWish:(p:Product)=>void;onAll:()=>void}){
 const ref=useRef<HTMLDivElement>(null);const [pos,setPos]=useState(0);const [end,setEnd]=useState(false);const [thumb,setThumb]=useState(100);
 const [detail,setDetail]=useState<HomeSection|null>(null);const [error,setError]=useState('');
 useEffect(()=>{const c=new AbortController();setDetail(null);fetchHomeSection(meta.id,c.signal).then(setDetail).catch(e=>{if(!c.signal.aborted)setError(String(e))});return()=>c.abort()},[meta.id]);
 const update=()=>{const e=ref.current;if(!e)return;const max=e.scrollWidth-e.clientWidth;setPos(max>0?e.scrollLeft/max:0);setThumb(Math.min(100,(e.clientWidth/Math.max(1,e.scrollWidth))*100));setEnd(max<2||e.scrollLeft>=max-2)};
 useEffect(()=>{update();const e=ref.current;if(!e)return;const resize=new ResizeObserver(update);resize.observe(e);return()=>resize.disconnect()},[detail]);
 const scroll=(direction:number)=>{const e=ref.current;if(e)e.scrollBy({left:direction*Math.round(e.clientWidth*.8),behavior:'smooth'})};
 const label=meta.title==='Recommended for you'?'See all':'Show all';
 return <section className="home-shelf"><div className="container"><h2 className="home-shelf-heading">{meta.title} <span className="round-info" title={meta.subtitle} aria-label={meta.subtitle}>i</span></h2>
  <p className="home-shelf-subtitle">{meta.subtitle}</p>
  {error?<p role="alert">Could not load products: {error}</p>:!detail?<p className="shelf-loading">Loading offers…</p>:<div className="shelf-scroll-area">
   <div className="eneba-track" ref={ref} onScroll={update}>{detail.products.map(p=>meta.title==='Best selling eGift Cards'?<GiftCardTile key={p.id} product={p} onOpen={onOpen}/>:<Card key={p.id} product={p} onOpen={onOpen} onAdd={onAdd} onWish={onWish}/>)}</div>
   {pos>.015&&<button type="button" className="track-arrow track-prev" aria-label={`Scroll ${meta.title} left`} onClick={()=>scroll(-1)}>‹</button>}
   {!end&&<button type="button" className="track-arrow track-next" aria-label={`Scroll ${meta.title} right`} onClick={()=>scroll(1)}>›</button>}
   <div className="eneba-progress" aria-hidden="true"><span style={{width:`${thumb}%`,left:`${pos*(100-thumb)}%`}}/></div>
  </div>}
  <button type="button" className="outlined-button centered" onClick={onAll}>{label}</button>
 </div></section>
}
const RECENT_KEY='eneba-demo-recently-viewed';
function RecentlyViewed({onOpen,onAdd,onWish}:{onOpen:(slug:string)=>void;onAdd:(p:Product)=>void;onWish:(p:Product)=>void}){
 const [products,setProducts]=useState<Product[]>([]);
 useEffect(()=>{
  const controller=new AbortController();
  let slugs:string[]=[];
  try{const stored=JSON.parse(localStorage.getItem(RECENT_KEY)||'[]');if(Array.isArray(stored))slugs=stored.filter((v):v is string=>typeof v==='string').slice(0,12)}catch{}
  if(slugs.length)Promise.allSettled(slugs.map(slug=>fetchProduct(slug,controller.signal))).then(rows=>{if(!controller.signal.aborted)setProducts(rows.filter((row):row is PromiseFulfilledResult<Product>=>row.status==='fulfilled').map(row=>row.value))});
  return()=>controller.abort();
 },[]);
 if(!products.length)return null;
 return <section className="recently-viewed home-shelf"><div className="container">
  <h2 className="home-shelf-heading">Recently viewed <span className="round-info" title="Products you've opened in this browser">i</span></h2>
  <div className="recently-track" aria-label="Recently viewed products">{products.map(p=><Card key={p.id} product={p} onOpen={onOpen} onAdd={onAdd} onWish={onWish}/>)}</div>
 </div></section>;
}
function ShortcutRow({categories,onBrowse}:{categories:HomeCategory[];onBrowse:()=>void}){
 const list=useRef<HTMLDivElement>(null);const shift=(n:number)=>list.current?.scrollBy({left:n*450,behavior:'smooth'});
 return <div className="shortcuts container"><button className="shortcut-arrow" onClick={()=>shift(-1)} aria-label="Previous categories">‹</button><nav ref={list} className="shortcut-track" aria-label="Categories">{categories.map(c=><button key={c.name} className="shortcut" onClick={onBrowse}><span className="shortcut-symbol"><ShortcutIcon name={c.icon} label={c.name}/></span><span>{c.name}</span></button>)}</nav><button className="shortcut-arrow" onClick={()=>shift(1)} aria-label="Next categories">›</button></div>
}
function Genres({genres,onBrowse}:{genres:HomeGenre[];onBrowse:()=>void}){
 const [visible,setVisible]=useState(6);
 const supported=['Action','Adventure','Simulation','Strategy','RPG','Indie','FPS / TPS','Puzzle','Sport','Racing','Fighting'];
 const shown=genres.filter(g=>supported.includes(g.name)).sort((a,b)=>supported.indexOf(a.name)-supported.indexOf(b.name));
 return <section className="genre-section"><div className="container"><h2 className="home-shelf-heading">Categories <span className="round-info" title="Explore marketplace categories" aria-label="Explore marketplace categories">i</span></h2><div className="genre-grid">{shown.slice(0,visible).map(g=><button type="button" key={g.id} className="genre-card" onClick={onBrowse}><span className="genre-count">{g.count.toLocaleString()}</span><span className="genre-glyph">{g.icon.startsWith('/')||g.icon.startsWith('https://')?<img src={g.icon} alt="" loading="lazy"/>:g.icon}</span><strong>{g.name}</strong></button>)}</div>{visible<shown.length&&<button type="button" className="outlined-button centered" onClick={()=>setVisible(n=>n+5)}>Load more</button>}</div></section>
}
export default function Homepage({onBrowse,onOpen,onAdd,onWish}:{onBrowse:()=>void;onOpen:(slug:string)=>void;onAdd:(p:Product)=>void;onWish:(p:Product)=>void}){
 const [banners,setBanners]=useState<HomeBanner[]>([]);const [categories,setCategories]=useState<HomeCategory[]>([]);const [sections,setSections]=useState<HomeSectionMeta[]>([]);const [genres,setGenres]=useState<HomeGenre[]>([]);const [error,setError]=useState('');
 useEffect(()=>{const c=new AbortController();Promise.all([fetchHomeBanners(c.signal),fetchHomeCategories(c.signal),fetchHomeSectionList(c.signal),fetchHomeGenres(c.signal)]).then(([b,cats,s,g])=>{setBanners(b);setCategories(cats);setSections(s);setGenres(g)}).catch(e=>{if(!c.signal.aborted)setError(String(e))});return()=>c.abort()},[]);
 return <main className="eneba-home">{error&&<div className="container notice error">Homepage couldn't load: {error}. Apply migration 007 and restart the Go API.</div>}
  <div className="promo-grid" aria-label="Featured promotions">{banners.map((b,i)=><button key={b.id} type="button" className={`promo-tile promo-${i===0?'main':'small'}`} onClick={onBrowse} aria-label={b.title} title={`${b.title} — browse demo products`} style={b.imageUrl?{backgroundImage:`url("${b.imageUrl}")`}:undefined}>{!b.imageUrl&&<span className="promo-fallback">{b.title}</span>}</button>)}</div>
  <ShortcutRow categories={categories} onBrowse={onBrowse}/>
  <RecentlyViewed onOpen={onOpen} onAdd={onAdd} onWish={onWish}/>
  {sections.map(s=><Shelf key={s.id} meta={s} onOpen={onOpen} onAdd={onAdd} onWish={onWish} onAll={onBrowse}/>)}
  <Genres genres={genres} onBrowse={onBrowse}/>
 </main>
}
