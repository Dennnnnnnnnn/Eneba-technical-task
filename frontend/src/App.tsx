import {useEffect, useState} from 'react';
import {fetchHomepage, fetchProducts, type Homepage, type Product} from './api';

function euro(cents: number, currency: string) {
  return new Intl.NumberFormat('en-IE', {style:'currency', currency}).format(cents/100);
}
const icons: Record<string,string> = {gamepad:'🎮',gift:'▤',card:'▣',wallet:'▧',steam:'◉',playstation:'♧',xbox:'✕',switch:'◧',tag:'⌁'};

function ProductCard({product}: {product: Product}) {
  const [imageFailed, setImageFailed] = useState(false);
  return <article className="product-card">
    <div className="product-art" style={{background: `linear-gradient(145deg, ${product.coverColor}, #211056)`}}>
      {product.coverImageUrl && !imageFailed ? <img src={product.coverImageUrl} alt={`${product.title} cover`} loading="lazy" onError={() => setImageFailed(true)} /> : <div className="art-fallback"><span>✦</span><b>{product.title}</b></div>}
      <span className="card-fav" aria-label="Favourite feature coming later">♡</span>
    </div>
    <div className="product-details">
      <div className="platform-ribbon">▰ {product.platform === 'PC' ? 'Steam' : product.platform}</div>
      <h3>{product.title} {product.platform === 'PC' ? 'Steam Key' : 'Digital Key'} ({product.platform})</h3>
      <div className="region">GLOBAL</div>
      <div className="price-from">From</div>
      <div className="price">{euro(product.minPriceCents, product.currency)}</div>
      <div className="seller-info">{product.offerCount} seller offers</div>
    </div>
  </article>;
}
function Shelf({title, subtitle, products, action}: {title: string; subtitle?: string; products: Product[]; action?: () => void}) {
  return <section className="shelf">
    <div className="shelf-heading"><div><h2>{title} <span className="info-icon">ⓘ</span></h2>{subtitle && <p>{subtitle}</p>}</div>{action && <button className="show-all" onClick={action}>Show all <span>›</span></button>}</div>
    <div className="cards-grid">{products.map(p => <ProductCard key={p.id} product={p}/>)}</div>
  </section>;
}

export default function App() {
  const [home, setHome] = useState<Homepage|null>(null);
  const [homeError, setHomeError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [view, setView] = useState<'home'|'store'>('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const openStore = () => {setView('store'); window.scrollTo({top:0,behavior:'smooth'});};
  const homeView = () => {setView('home'); setSearch(''); window.scrollTo({top:0,behavior:'smooth'});};

  useEffect(() => {
    const c = new AbortController();
    fetchHomepage(c.signal).then(setHome).catch(e => {if(!c.signal.aborted) setHomeError(e instanceof Error?e.message:'Unable to load homepage');});
    return () => c.abort();
  }, []);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);setError('');
    const id = window.setTimeout(() => {
      fetchProducts({q:search,platform,sort},c.signal).then(setProducts).catch(e => {if(!c.signal.aborted)setError(e instanceof Error?e.message:'Unknown error');}).finally(() => {if(!c.signal.aborted)setLoading(false);});
    },220);
    return () => {clearTimeout(id);c.abort();};
  }, [search,platform,sort]);

  return <div className="site-shell">
    <header className="site-header">
      <div className="topbar container">
        <button className="brand" onClick={homeView} aria-label="KeyMarket home"><span className="brand-symbol"><i/><i/><i/></span><span>keymarket</span></button>
        <label className="search-wrap"><span className="search-icon">⌕</span><input placeholder="Search for games, top-ups and more" aria-label="Search for products" value={search} onChange={e => {setSearch(e.target.value);if(e.target.value.trim())setView('store');}} /></label>
        <span className="locale">◎ English EU | EUR</span>
        <button className="top-icon" title="Wishlist feature planned">♡</button>
        <button className="top-icon" title="Cart feature planned">🛒</button>
        <span className="auth-link">Log in <span>|</span> Register</span>
      </div>
      <div className="nav-band"><nav className="container nav-links" aria-label="Main navigation">
        <button onClick={openStore}>☰ &nbsp; Categories</button><button onClick={openStore}>Cheap Games</button><button onClick={openStore}>Software</button><button onClick={openStore}>eGift Cards</button><button onClick={openStore}>Eneba Gift Cards</button><button onClick={openStore}>Cheap PSN</button><button onClick={openStore}>GTA</button><button className="special-link" onClick={openStore}>BLACK WEEK</button>
      </nav></div>
    </header>

    {view==='home' ? <main className="homepage">
      {homeError ? <div className="container notice error">Could not load homepage: {homeError}. Run migrations and the Go API.</div> : !home ? <div className="container notice">Loading homepage from the Go API…</div> : <>
        <div className="hero-area"><section className="hero-banner container">
          <div className="hero-text"><span className="hero-eyebrow">{home.hero.eyebrow}</span><h1>{home.hero.title}</h1><p>{home.hero.subtitle}</p><button className="yellow-button" onClick={openStore}>{home.hero.buttonText} <span>→</span></button></div>
          {home.hero.imageUrl && <div className="hero-image" style={{backgroundImage:`linear-gradient(90deg,#29115b 0%, transparent 55%),url("${home.hero.imageUrl}")`}} aria-hidden="true"/>}
          <span className="hero-label">DIGITAL GAME KEYS</span>
        </section></div>
        <nav className="category-links container" aria-label="Marketplace categories">{home.categories.map(c => <button key={c.name} onClick={openStore}><span className="category-icon">{icons[c.icon]||'◈'}</span><span>{c.name}</span></button>)}</nav>
        <div className="home-content container">{home.sections.map(s => <Shelf key={s.title} title={s.title} subtitle={s.subtitle} products={s.products} action={openStore}/>)}</div>
      </>}
    </main> : <main className="container store-view" id="store">
      <div className="breadcrumb"><button onClick={homeView}>Home</button><span>›</span> All games</div>
      <div className="store-head"><h1>Games</h1><p>Discover game keys from multiple sellers.</p></div>
      <div className="store-layout"><aside className="filter-panel"><h2>Filters</h2><label>Platform<select value={platform} onChange={e=>setPlatform(e.target.value)}><option value="">All platforms</option><option value="PC">PC</option><option value="Xbox">Xbox</option><option value="Switch">Switch</option></select></label><button onClick={()=>{setPlatform('');setSearch('');setSort('name_asc');}}>Clear filters</button></aside>
      <div className="store-results"><div className="results-header"><span>{loading?'Loading…':`${products.length} games found`}</span><label>Sort by <select value={sort} onChange={e=>setSort(e.target.value)}><option value="name_asc">Name: A–Z</option><option value="name_desc">Name: Z–A</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select></label></div>
      {error ? <div className="notice error">Couldn't load products: {error}</div> : loading ? <div className="notice">Loading games from PostgreSQL…</div> : products.length===0 ? <div className="notice">No games found. Try changing the filters.</div> : <div className="cards-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>}
      </div></div>
    </main>}
    <footer className="footer"><div className="container footer-content"><div><strong>keymarket</strong><p>Digital games marketplace · Internship demo</p></div><div><strong>About this project</strong><p>Inspired by Eneba's interface. Independent educational project, not affiliated with Eneba. Checkout and login arrive in later phases.</p></div></div></footer>
  </div>;
}
