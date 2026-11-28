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
function CashbackIcon(){return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g clipPath="url(#cashbackBadgeClip)"><path d="M6.55768 14.5095C8.12445 14.8566 9.76387 14.6269 11.1749 13.8626C12.586 13.0983 13.674 11.8506 14.2392 10.3487C14.8044 8.84672 14.8088 7.1913 14.2517 5.68633C13.6946 4.18137 12.6134 2.92785 11.2065 2.15593C9.79954 1.384 8.1614 1.14548 6.59277 1.48414C5.02415 1.8228 3.6303 2.71594 2.66718 3.99953C1.70407 5.28313 1.23625 6.87109 1.34969 8.47182C1.46308 10.0726 2.15012 11.5787 3.28463 12.7137L4.37371 13.8028M1.47198 13.8013H4.37233V10.901" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 5.33398V8.00065V10.6673" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.33301 8H10.6663" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="cashbackBadgeClip"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>}

function resolvePlatformLabel(product:Product){
 const lowerTitle=product.title.toLowerCase();
 if(product.platform==='PlayStation'||lowerTitle.includes('playstation')||lowerTitle.includes('psn')||lowerTitle.includes('ps5')) return 'PSN';
 if(product.platform==='Xbox'||lowerTitle.includes('xbox')) return 'Xbox Live';
 if(product.platform==='Switch'||lowerTitle.includes('nintendo')||lowerTitle.includes('switch')) return 'Nintendo';
 if(product.platform==='Windows') return 'Windows Store';
 if(product.platform==='PC'){
  if(lowerTitle.includes('steam')) return 'Steam';
  if(lowerTitle.includes('gog')) return 'GOG.com';
  if(lowerTitle.includes('ea app')) return 'EA app';
  return 'PC';
 }
 if(product.platform==='Gift Card'){
  if(lowerTitle.includes('roblox')) return 'Roblox';
  if(lowerTitle.includes('playstation')||lowerTitle.includes('psn')) return 'PSN';
  if(lowerTitle.includes('steam')) return 'Steam';
  if(lowerTitle.includes('xbox')) return 'Xbox Live';
  if(lowerTitle.includes('nintendo')) return 'Nintendo';
  if(lowerTitle.includes('spotify')) return 'Spotify';
  if(lowerTitle.includes('netflix')) return 'Netflix';
  if(lowerTitle.includes('amazon')) return 'Amazon';
  if(lowerTitle.includes('apple')||lowerTitle.includes('itunes')) return 'Apple';
  if(lowerTitle.includes('razer')) return 'Razer Gold';
  if(lowerTitle.includes('binance')) return 'Binance';
  return 'Gift Card';
 }
 return product.platform;
}
function GiftIcon(){return <svg className="platform-logo gift-platform-logo" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M5.85015 11.817C5.84157 11.0126 6.14493 10.2376 6.69349 9.6626C7.24204 9.08761 7.99085 8.75968 8.77515 8.75098H14.6252C15.4095 8.75968 16.1583 9.08761 16.7068 9.6626C17.2554 10.2376 17.5587 11.0126 17.5502 11.817V16.927C17.5675 18.6017 16.258 19.9738 14.6252 19.992H8.77515C7.99085 19.9833 7.24204 19.6553 6.69349 19.0803C6.14493 18.5054 5.84157 17.7304 5.85015 16.926V11.817Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path fillRule="evenodd" clipRule="evenodd" d="M12.3719 5.837L12.7834 7.498L12.9481 8.06L13.1821 7.115C13.271 6.70798 13.5174 6.35553 13.8648 6.13864C14.2122 5.92175 14.6306 5.85907 15.0239 5.965C15.8426 6.22815 16.3123 7.10774 16.0876 7.957C15.993 8.39935 15.6236 8.72353 15.1828 8.751H9.75015C8.84861 8.70804 8.09459 8.03409 7.92982 7.124C7.583 5.82513 8.30164 4.4779 9.55515 4.077C10.1569 3.91498 10.797 4.01099 11.3283 4.34295C11.8596 4.67492 12.2363 5.21427 12.3719 5.837Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.6796 8.23006C13.7735 7.82664 13.5226 7.42346 13.1192 7.32953C12.7157 7.23561 12.3126 7.48651 12.2186 7.88993M12.0578 8.58093C11.9638 8.98436 12.2147 9.38754 12.6182 9.48146C13.0216 9.57539 13.4248 9.32448 13.5187 8.92106M12.4501 8.751C12.4501 8.33678 12.1143 8.001 11.7001 8.001C11.2859 8.001 10.9501 8.33678 10.9501 8.751V19.992C10.9501 20.4062 11.2859 20.742 11.7001 20.742C12.1143 20.742 12.4501 20.4062 12.4501 19.992V8.751Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}

export function Card({product,onOpen,onAdd,onWish}:{product:Product;onOpen:(slug:string)=>void;onAdd:(p:Product)=>void;onWish:(p:Product)=>void}){
 const [failed,setFailed]=useState(false);
 const lowerTitle=product.title.toLowerCase();
 const platform=resolvePlatformLabel(product);
 const region=product.region==='EU'?'EUROPE':product.region==='US'?'UNITED STATES':product.region;
 const cashback=Math.round(product.minPriceCents*(product.cashbackPercent??0)/100);
 return <article className="eneba-card">
  <div className="eneba-art" style={{background:product.coverColor}}>
   <button type="button" className="eneba-cover-link" onClick={()=>onOpen(product.slug)} aria-label={`View ${product.title}`}>
    {product.coverImageUrl&&!failed?<img src={product.coverImageUrl} alt={`${product.title} cover`} loading="lazy" onError={()=>setFailed(true)}/>:<div className="eneba-fallback">{product.title}</div>}
   </button>
   <button type="button" className="eneba-wish" aria-label={`Save ${product.title} to wishlist`} onClick={()=>onWish(product)}><HeartIcon width={23} height={23}/></button>
   {cashback>0&&<span className="cashback-badge"><CashbackIcon/> <span>CASHBACK</span></span>}
  </div>
  <div className="eneba-card-copy">
   <div className="eneba-platform"><PlatformMark platform={platform}/> {platform}</div>
   <button className="eneba-title" onClick={()=>onOpen(product.slug)} title={product.title}>{product.title} ({product.platform}) Key</button>
   <div className={`eneba-region ${['GLOBAL','EUROPE','FRANCE'].includes(region)?'region-green':'region-pink'}`}>{region}</div>
   <span className="eneba-from">From</span>
   <div className="eneba-price">{money(product.minPriceCents,product.currency)} <span className="round-info" title="Price from the cheapest seller">i</span></div>
   <div className="eneba-cashback">{cashback>0?<><span className="cashback-inline-icon"><CashbackIcon/></span>Cashback: {money(cashback,product.currency)}</>:'Demo digital key'}</div>
   <div className="eneba-card-actions"><button type="button" className="card-add" onClick={()=>onAdd(product)}>Add to cart</button><button type="button" className="card-offers" onClick={()=>onOpen(product.slug)}>View offers</button></div>
  </div>
 </article>
}
function PlatformMark({platform}:{platform:string}){
 const kind=platform.toLowerCase();
 if(kind.includes('xbox'))return <img className="platform-logo platform-logo-image" src="/shortcut-icons/xbox.svg" alt="" loading="lazy" aria-hidden="true"/>;
 if(kind.includes('steam')||kind==='pc')return <img className="platform-logo platform-logo-image" src="/shortcut-icons/steam.svg" alt="" loading="lazy" aria-hidden="true"/>;
 if(kind.includes('nintendo')||kind.includes('switch'))return <img className="platform-logo platform-logo-image" src="/shortcut-icons/nintendo.svg" alt="" loading="lazy" aria-hidden="true"/>;
 if(kind.includes('psn')||kind.includes('playstation')||kind.includes('ps5'))return <img className="platform-logo platform-logo-image" src="/shortcut-icons/psn.svg" alt="" loading="lazy" aria-hidden="true"/>;
 if(kind.includes('roblox'))return <svg className="platform-logo" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9 2 30 9 23 30 2 23 9 2Zm6 9-4 6 6 4 4-6-6-4Z"/></svg>;
 if(kind.includes('windows')||kind.includes('store'))return <svg className="platform-logo" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M2 5 15 3v12H2V5Zm16-2 12-2v14H18V3ZM2 18h13v12L2 28V18Zm16 0h12v14l-12-2V18Z"/></svg>;
 if(kind.includes('spotify'))return <svg className="platform-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.75a10.25 10.25 0 1 0 0 20.5 10.25 10.25 0 0 0 0-20.5Zm4.84 14.73a.9.9 0 0 1-1.24.3c-3.4-2.08-7.68-2.55-12.73-1.4a.9.9 0 1 1-.4-1.76c5.54-1.26 10.3-.72 14.07 1.58.42.26.56.81.3 1.28Zm1.76-3.22a1.13 1.13 0 0 1-1.54.37c-3.89-2.39-9.81-3.08-14.42-1.69a1.13 1.13 0 0 1-.66-2.16c5.29-1.61 11.85-.84 16.26 1.87.53.33.7 1.02.36 1.6Zm.15-3.35C14.14 7.1 6.53 6.84 2.12 8.2a1.35 1.35 0 1 1-.79-2.59c5.07-1.55 13.5-1.25 18.82 1.9a1.35 1.35 0 0 1-1.4 2.4Z"/></svg>;
 if(kind.includes('netflix'))return <svg className="platform-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 2h4l4.1 11.66V2H18v20l-4.02-.59L10 10.7V21.2L6 22V2Z"/></svg>;
 if(kind.includes('amazon'))return <svg className="platform-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.58 15.56c-.92.68-2.24 1.05-3.39 1.05-1.61 0-3.05-.6-4.15-1.6-.09-.08-.01-.19.09-.13 1.19.7 2.65 1.13 4.16 1.13 1.02 0 2.14-.22 3.16-.67.16-.07.3.1.13.22Zm.38 1.34c-.12.17-.78.08-1.08.04-.1-.01-.12.07-.03.14.57.4 1.49.28 1.6.15.12-.12.31-1.02-.22-1.45-.08-.06-.15-.03-.11.06.12.3.36.9.24 1.06ZM15.4 12.6V8.95c0-.28 0-.53-.2-.73-.17-.16-.46-.22-.68-.22-.64 0-1.22.33-1.36 1.04-.03.16-.15.32-.31.33l-1.77-.19c-.15-.03-.31-.16-.27-.39.41-2.15 2.35-2.8 4.08-2.8.88 0 2.03.23 2.72.9.88.83.79 1.94.79 3.15v2.86c0 .86.36 1.23.7 1.7.12.17.14.36 0 .48-.37.31-1.02.88-1.38 1.19-.17.09-.41.1-.56-.03-.36-.3-.57-.44-.83-.83-.79.81-1.35 1.05-2.38 1.05-1.22 0-2.17-.75-2.17-2.26 0-1.18.64-1.98 1.55-2.37.79-.35 1.9-.41 2.74-.5v-.19c0-.35.03-.77-.18-1.07-.18-.27-.53-.38-.83-.38-.57 0-1.08.29-1.21.9-.03.14-.14.28-.28.29l-1.72-.19c-.14-.03-.29-.15-.25-.36.35-1.83 2-2.38 3.49-2.38.76 0 1.75.2 2.35.77.76.69.69 1.61.69 2.61Zm-2.4 1.91c.39 0 .75-.2 1.01-.52.32-.39.41-.76.41-1.36v-.24c-1.04.11-2.14.22-2.14 1.27 0 .53.27.85.72.85Z"/></svg>;
 if(kind.includes('apple'))return <svg className="platform-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.76 1.75c.08.89-.24 1.76-.75 2.41-.57.74-1.46 1.33-2.37 1.25-.12-.86.27-1.78.78-2.38.57-.68 1.53-1.22 2.34-1.28ZM19.8 16.85c-.47 1.08-.69 1.56-1.3 2.55-.84 1.36-2.02 3.05-3.48 3.07-1.3.02-1.64-.84-3.4-.83-1.76.01-2.13.85-3.43.83-1.45-.02-2.56-1.55-3.4-2.9-2.35-3.82-2.6-8.29-1.15-10.53 1.03-1.6 2.66-2.53 4.2-2.53 1.57 0 2.56.86 3.86.86 1.26 0 2.03-.86 3.85-.86 1.37 0 2.82.75 3.85 2.05-3.38 1.85-2.83 6.62.4 8.29Z"/></svg>;
 if(kind.includes('razer'))return <svg className="platform-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10.2 2.3c1.2-.12 2.45.47 3.12 1.5.6.9.7 2.06.32 3.07l.12.08c1.36-.36 2.9-.04 3.9.96 1.33 1.33 1.42 3.43.28 4.88-.83 1.07-2.2 1.6-3.54 1.4l-.06.16c.99.63 1.64 1.75 1.64 2.98A3.77 3.77 0 0 1 12.2 21a3.7 3.7 0 0 1-2.8-1.27A3.75 3.75 0 0 1 8.61 16l-.17-.07c-1.31.33-2.75-.05-3.71-.99a3.83 3.83 0 0 1-.36-5.09 3.83 3.83 0 0 1 3.8-1.27l.1-.11a3.76 3.76 0 0 1 1.93-6.17Z"/></svg>;
 if(kind.includes('binance'))return <svg className="platform-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.6 2.7 2.72-2.7 2.7-2.7-2.7L12 2.6Zm-4.39 4.38 2.7 2.71-2.7 2.7-2.7-2.7 2.7-2.7ZM16.39 6.98l2.7 2.71-2.7 2.7-2.7-2.7 2.7-2.7ZM12 11.37l2.7 2.71-2.7 2.7-2.7-2.7 2.7-2.7Zm-4.39 4.39 2.7 2.7L12 20.2l1.69-1.74 2.7-2.7-2.7-2.7L12 14.76l-1.69-1.7-2.7 2.7Z"/></svg>;
 if(kind.includes('gift'))return <GiftIcon/>;
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
 const [visible,setVisible]=useState(11);
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
