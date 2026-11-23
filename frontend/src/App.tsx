import {useEffect,useState} from 'react';
import {fetchHomepage,fetchOffers,fetchProduct,fetchProducts,type Filters,type Homepage,type Offer,type Product,type ProductPage} from './api';

function euro(cents:number,currency='EUR'){return new Intl.NumberFormat('en-IE',{style:'currency',currency}).format(cents/100)}
const icons:Record<string,string>={gamepad:'🎮',gift:'▤',card:'▣',wallet:'▧',steam:'◉',playstation:'♧',xbox:'✕',switch:'◧',tag:'⌁'};
const DEFAULT:Filters={q:'',platform:'',region:'',sort:'name_asc',page:1,pageSize:12};
type View='home'|'store'|'product';
function ProductCard({product,onOpen}:{product:Product;onOpen:(slug:string)=>void}){
 const [failed,setFailed]=useState(false);
 return <button className="product-card product-card-button" onClick={()=>onOpen(product.slug)} aria-label={`View ${product.title} offers`}>
  <div className="product-art" style={{background:`linear-gradient(145deg,${product.coverColor},#211056)`}}>
   {product.coverImageUrl&&!failed?<img src={product.coverImageUrl} alt={`${product.title} cover`} loading="lazy" onError={()=>setFailed(true)}/>:<div className="art-fallback"><span>✦</span><b>{product.title}</b></div>}
  </div>
  <div className="product-details"><div className="platform-ribbon">▰ {product.platform==='PC'?'Steam':product.platform}</div>
   <h3>{product.title} {product.platform==='PC'?'Steam Key':'Digital Key'} ({product.platform})</h3>
   <div className="region">DIGITAL KEY</div><div className="price-from">From</div><div className="price">{euro(product.minPriceCents,product.currency)}</div><div className="seller-info">{product.offerCount} seller offers</div>
  </div>
 </button>;
}
function Shelf({title,subtitle,products,onOpen,onAll}:{title:string;subtitle:string;products:Product[];onOpen:(slug:string)=>void;onAll:()=>void}){
 return <section className="shelf"><div className="shelf-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="show-all" onClick={onAll}>Show all ›</button></div><div className="cards-grid">{products.map(p=><ProductCard key={p.id} product={p} onOpen={onOpen}/>)}</div></section>
}
export default function App(){
 const [view,setView]=useState<View>('home');
 const [home,setHome]=useState<Homepage|null>(null);const [homeError,setHomeError]=useState('');
 const [filters,setFilters]=useState<Filters>(DEFAULT);const [minInput,setMinInput]=useState('');const [maxInput,setMaxInput]=useState('');
 const [results,setResults]=useState<ProductPage|null>(null);const [loading,setLoading]=useState(false);const [error,setError]=useState('');
 const [slug,setSlug]=useState('');const [product,setProduct]=useState<Product|null>(null);const [offers,setOffers]=useState<Offer[]>([]);const [detailLoading,setDetailLoading]=useState(false);const [detailError,setDetailError]=useState('');
 function navigate(next:View,productSlug=''){
  setView(next);setSlug(productSlug);
  const path=next==='home'?'/':next==='store'?'/store':`/products/${encodeURIComponent(productSlug)}`;
  window.history.pushState({},'',path);window.scrollTo({top:0,behavior:'smooth'});
 }
 function applyLocation(){const p=window.location.pathname;if(p.startsWith('/products/')){setSlug(decodeURIComponent(p.slice('/products/'.length)));setView('product')}else if(p==='/store'){setView('store')}else setView('home')}
 useEffect(()=>{applyLocation();window.addEventListener('popstate',applyLocation);return()=>window.removeEventListener('popstate',applyLocation)},[]);
 const store=()=>navigate('store');const homeView=()=>navigate('home');const openProduct=(s:string)=>navigate('product',s);
 const update=(next:Partial<Filters>)=>setFilters(f=>({...f,...next,page:next.page??1}));
 useEffect(()=>{const c=new AbortController();fetchHomepage(c.signal).then(setHome).catch(e=>{if(!c.signal.aborted)setHomeError(String(e))});return()=>c.abort()},[]);
 useEffect(()=>{
  if(view!=='store')return;
  const c=new AbortController();setLoading(true);setError('');
  const timer=window.setTimeout(()=>fetchProducts(filters,c.signal).then(setResults).catch(e=>{if(!c.signal.aborted)setError(String(e))}).finally(()=>{if(!c.signal.aborted)setLoading(false)}),180);
  return()=>{window.clearTimeout(timer);c.abort()};
 },[view,filters]);
 useEffect(()=>{
  if(view!=='product'||!slug)return;
  const c=new AbortController();setProduct(null);setOffers([]);setDetailError('');setDetailLoading(true);
  Promise.all([fetchProduct(slug,c.signal),fetchOffers(slug,c.signal)]).then(([p,o])=>{setProduct(p);setOffers(o)}).catch(e=>{if(!c.signal.aborted)setDetailError(String(e))}).finally(()=>{if(!c.signal.aborted)setDetailLoading(false)});
  return()=>c.abort();
 },[view,slug]);
 const applyPrices=()=>{const minimum=minInput.trim()===''?undefined:Math.round(Number(minInput)*100),maximum=maxInput.trim()===''?undefined:Math.round(Number(maxInput)*100);
  if((minimum!==undefined&&(!Number.isFinite(minimum)||minimum<0))||(maximum!==undefined&&(!Number.isFinite(maximum)||maximum<0))||(minimum!==undefined&&maximum!==undefined&&minimum>maximum)){setError('Enter valid prices: minimum must not exceed maximum.');return}
  setError('');update({minPriceCents:minimum,maxPriceCents:maximum});};
 const clear=()=>{setFilters(DEFAULT);setMinInput('');setMaxInput('');setError('')};
 return <div className="site-shell"><header className="site-header"><div className="topbar container">
  <button className="brand" onClick={homeView} aria-label="KeyMarket home"><span className="brand-symbol"><i/><i/><i/></span><span>keymarket</span></button>
  <label className="search-wrap"><span className="search-icon">⌕</span><input placeholder="Search for games, top-ups and more" aria-label="Search for products" value={filters.q} onChange={e=>{update({q:e.target.value,sort:e.target.value?'relevance':'name_asc'});if(e.target.value.trim()&&view!=='store')navigate('store')}} onKeyDown={e=>{if(e.key==='Enter')store()}}/></label>
  <span className="locale">◎ English EU | EUR</span><span className="top-icon" title="Wishlist planned for later">♡</span><span className="top-icon" title="Cart planned for Phase 3">🛒</span><span className="auth-link" title="Authentication planned for Phase 3">Log in <span>|</span> Register</span>
 </div><div className="nav-band"><nav className="container nav-links" aria-label="Main navigation"><button onClick={store}>☰ &nbsp; Categories</button><button onClick={store}>Cheap Games</button><button onClick={store}>Software</button><button onClick={store}>eGift Cards</button><button onClick={store}>Gaming eCards</button><button onClick={store}>GTA</button><button className="special-link" onClick={store}>BLACK WEEK</button></nav></div></header>
 {view==='home'?<main className="homepage">{homeError?<div className="container notice error">Could not load homepage: {homeError}</div>:!home?<div className="container notice">Loading homepage…</div>:<>
  <div className="hero-area"><section className="hero-banner container"><div className="hero-text"><span className="hero-eyebrow">{home.hero.eyebrow}</span><h1>{home.hero.title}</h1><p>{home.hero.subtitle}</p><button className="yellow-button" onClick={store}>{home.hero.buttonText} →</button></div>{home.hero.imageUrl&&<div className="hero-image" style={{backgroundImage:`linear-gradient(90deg,#29115b 0%, transparent 55%),url("${home.hero.imageUrl}")`}} aria-hidden="true"/>}<span className="hero-label">DIGITAL GAME KEYS</span></section></div>
  <nav className="category-links container" aria-label="Marketplace categories">{home.categories.map(c=><button key={c.name} onClick={store}><span className="category-icon">{icons[c.icon]||'◈'}</span><span>{c.name}</span></button>)}</nav>
  <div className="home-content container">{home.sections.map(s=><Shelf key={s.title} title={s.title} subtitle={s.subtitle} products={s.products} onOpen={openProduct} onAll={store}/>)}</div>
 </>}</main>:view==='store'?<main className="container store-view"><div className="breadcrumb"><button onClick={homeView}>Home</button><span>›</span>Games</div><div className="store-head"><h1>Games</h1><p>Explore offers from different sellers. Search even with incomplete names or typos.</p></div>
 <div className="store-layout"><aside className="filter-panel"><h2>Filters</h2><label>Platform<select value={filters.platform} onChange={e=>update({platform:e.target.value})}><option value="">All platforms</option><option value="PC">PC</option><option value="Xbox">Xbox</option><option value="Switch">Switch</option></select></label>
 <label>Region<select value={filters.region} onChange={e=>update({region:e.target.value})}><option value="">All regions</option><option value="GLOBAL">Global</option><option value="EU">Europe</option><option value="US">United States</option></select></label>
 <label>Minimum price (€)<input type="number" min="0" step="0.01" placeholder="0.00" value={minInput} onChange={e=>setMinInput(e.target.value)}/></label>
 <label>Maximum price (€)<input type="number" min="0" step="0.01" placeholder="50.00" value={maxInput} onChange={e=>setMaxInput(e.target.value)}/></label>
 <button className="apply-button" onClick={applyPrices}>Apply price</button><button className="clear-button" onClick={clear}>Clear filters</button></aside>
 <div className="store-results"><div className="results-header"><span>{loading?'Loading…':`${results?.total??0} games found`}</span><label>Sort by <select value={filters.sort} onChange={e=>update({sort:e.target.value})}><option value="name_asc">Name A–Z</option><option value="name_desc">Name Z–A</option><option value="price_asc">Price low to high</option><option value="price_desc">Price high to low</option><option value="relevance">Best match</option></select></label></div>
 {error?<div className="notice error">{error}</div>:loading?<div className="notice">Loading games from PostgreSQL…</div>:!results?.items?.length?<div className="notice">No games found. Try changing filters or spelling.</div>:<><div className="cards-grid">{(results?.items ?? []).map(p=><ProductCard key={p.id} product={p} onOpen={openProduct}/>)}</div><nav className="pagination" aria-label="Catalog pagination"><button disabled={filters.page<=1} onClick={()=>update({page:filters.page-1})}>← Previous</button><span>Page {results.page} of {Math.max(1,results.totalPages)}</span><button disabled={filters.page>=results.totalPages} onClick={()=>update({page:filters.page+1})}>Next →</button></nav></>}
 </div></div></main>:<main className="container product-view"><div className="breadcrumb"><button onClick={homeView}>Home</button><span>›</span><button onClick={store}>Games</button><span>›</span>{product?.title||slug}</div>
 {detailLoading?<div className="notice">Loading product and seller offers…</div>:detailError?<div className="notice error">{detailError}</div>:product?<><div className="product-summary"><div className="detail-cover" style={{background:product.coverColor}}>{product.coverImageUrl?<img src={product.coverImageUrl} alt={`${product.title} cover`}/>:<strong>{product.title}</strong>}</div><div className="summary-copy"><span className="detail-tag">DIGITAL GAME KEY · {product.platform}</span><h1>{product.title}</h1><p>{product.description}</p><div className="detail-stat">Platform <strong>{product.platform}</strong></div><div className="detail-stat">Available offers <strong>{offers.length}</strong></div><div className="detail-stat">Best price <strong>{euro(product.minPriceCents,product.currency)}</strong></div></div></div>
 <section className="seller-section"><h2>Compare seller offers</h2><p>Independent sellers may list the same game at different prices and regions.</p><div className="offer-list">{offers.map((o,i)=><article className="offer-row" key={o.id}><div><b>{o.sellerName}</b>{i===0&&<span className="best-price-label">Lowest price</span>}<p>{o.region} · Digital key</p></div><div className="offer-price">{euro(o.priceCents,o.currency)}</div><button disabled title="Checkout is planned for Phase 3">Buy (Phase 3)</button></article>)}</div></section></>:null}</main>}
 <footer className="footer"><div className="container footer-content"><div><strong>keymarket</strong><p>Digital games marketplace · Internship demonstration</p></div><div><strong>Independent project</strong><p>Eneba-inspired educational design. No affiliation. Cart, login, and checkout are planned for Phase 3.</p></div></div></footer></div>;
}
