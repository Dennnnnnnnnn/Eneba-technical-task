import {useEffect, useMemo, useState} from 'react';
import type {Offer, Product} from './api';
import './product-page.css';
import {HeartIcon,CartIcon} from './UiIcons';

const money=(cents:number,currency='EUR')=>new Intl.NumberFormat('en-IE',{style:'currency',currency}).format(cents/100);

function Icon({kind}:{kind:'check'|'key'|'refund'|'desktop'|'globe'|'cart'|'heart'|'info'|'star'}){
 const common={viewBox:'0 0 24 24',width:24,height:24,fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true as const};
 if(kind==='check')return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="m6.5 12 3.5 3.5 7.5-8"/></svg>;
 if(kind==='key')return <svg {...common}><circle cx="16.5" cy="7.5" r="5"/><path d="M12.9 11.1 2 22v-5l3-3h3v-3h3z"/></svg>;
 if(kind==='refund')return <svg {...common}><path d="M3 8v6h6M3.5 14A9 9 0 1 0 6 5.2"/><path d="M8 12h8m-4-4v8"/></svg>;
 if(kind==='desktop')return <svg {...common}><rect x="2" y="4" width="20" height="14" rx="1"/><path d="M8 22h8m-4-4v4"/></svg>;
 if(kind==='globe')return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c-6 6-6 14 0 20 6-6 6-14 0-20"/></svg>;
 if(kind==='heart')return <HeartIcon/>;
 if(kind==='cart')return <CartIcon/>;
 if(kind==='star')return <svg {...common} fill="currentColor" stroke="none"><path d="m12 2 3.1 6.4 7.1 1-5.1 5 .9 7.1-6-3.3-6 3.3 1.1-7.1-5.2-5 7.1-1Z"/></svg>;
 return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="M12 10v7M12 6.5v.2"/></svg>;
}

type Props={product:Product;offers:Offer[];busy:boolean;error:string;onAdd:(id:number)=>void;onCart:()=>void;onSignIn:()=>void;authenticated:boolean;onNotice:(message:string)=>void};
export default function ProductDetail({product,offers,busy,error,onAdd,onCart,onSignIn,authenticated,onNotice}:Props){
 const sorted=useMemo(()=>[...offers].sort((a,b)=>a.priceCents-b.priceCents),[offers]);
 const regions=useMemo(()=>Array.from(new Set(sorted.map(o=>o.region))).sort(),[sorted]);
 const [region,setRegion]=useState('ALL');
 const [expanded,setExpanded]=useState(false);
 const [wishlist,setWishlist]=useState(false);
 useEffect(()=>{setRegion('ALL');setExpanded(false);setWishlist(false)},[product.slug]);
 const eligible=sorted.filter(o=>region==='ALL'||o.region===region);
 const recommended=eligible.slice(0,2);
 const rest=eligible.slice(2);
 const listed=expanded?rest:rest.slice(0,3);
 const featured=recommended[0];
 const cashback=(amount:number)=>money(Math.round(amount*(product.cashbackPercent||0)/100),featured?.currency||'EUR');
 const platform=(product.title.toLowerCase().includes('gog')?'GOG.com':product.platform==='PC'?'PC':product.platform);
 const activation=platform==='GOG.com'?'GOG.com':product.platform==='PC'?'the indicated PC launcher':product.platform;
 function putInCart(id:number){onAdd(id)}
 function fakePayPal(id:number){onNotice('PayPal is not connected in this educational demo. This offer can be added to the simulated checkout.');putInCart(id)}
 const row=(offer:Offer,index:number,top:boolean)=><article className="pd-offer" key={offer.id}>
  <div className="pd-seller"><div className="pd-seller-avatar">{offer.sellerName.slice(0,1).toUpperCase()}</div><div><strong>{offer.sellerName}</strong><span>Marketplace seller · Demo listing</span>{top&&index===0&&<small className="pd-featured-label">Featured offer · Lowest available price</small>}</div></div>
  <div className="pd-offer-buyarea"><div className="pd-offer-price"><b>{money(offer.priceCents,offer.currency)}</b><span className="pd-money-note">{product.cashbackPercent>0?`${product.cashbackPercent}% illustrative cashback`:'Digital key'}</span></div>
   <div className="pd-offer-action"><button type="button" className="pd-buy-outline" disabled={busy} onClick={()=>putInCart(offer.id)}>{busy?'Adding…':'Buy now'}</button><div className="pd-hover-actions"><button type="button" disabled={busy} onClick={()=>fakePayPal(offer.id)} aria-label={`PayPal demo for ${offer.sellerName}`}>PayPal</button><button type="button" disabled={busy} onClick={()=>putInCart(offer.id)} aria-label={`Add ${offer.sellerName} offer to cart`}><Icon kind="cart"/></button></div></div>
  </div>
 </article>;
 return <div className="pd-layout"><div className="pd-main">
  <section className="pd-intro"><div className="pd-cover" style={{background:product.coverColor}}>{product.coverImageUrl?<img src={product.coverImageUrl} alt={`${product.title} game cover`}/>:<strong>{product.title}</strong>}</div><div className="pd-overview"><span className="pd-cashback-pill">✧ Cashback deal · demo</span><h1>{product.title}</h1><div className="pd-features"><div className="pd-feature"><Icon kind="check"/><div><strong>Can be activated in Lithuania*</strong><span>Check region restrictions</span></div></div><div className="pd-feature"><Icon kind="globe"/><div><strong>{activation}</strong><span>Check activation instructions</span></div></div><div className="pd-feature"><Icon kind="key"/><div><strong>Digital edition (CD-KEY)</strong><em>Delivery after demo checkout</em></div></div><div className="pd-feature"><Icon kind="refund"/><div><strong>Refund availability</strong><span>Demo purchases are nonredeemable; no payments taken</span></div></div></div><div className="pd-compat"><span><Icon kind="desktop"/> Works on: <strong>{product.platform==='PC'?'Windows':product.platform}</strong></span><button type="button" onClick={()=>onNotice('Detailed system requirements are not yet provided by the catalog API.')}>Check requirements</button></div><p className="pd-region-footnote">*Region compatibility is illustrative. Check the specific offer region before buying.</p></div><button type="button" className={`pd-favorite ${wishlist?'pd-favorite-active':''}`} aria-pressed={wishlist} aria-label={wishlist?'Remove from local wishlist':'Save to local wishlist'} onClick={()=>setWishlist(v=>!v)}><Icon kind="heart"/><span>{wishlist?'Saved':'Save'}</span></button></section>
  <div className="pd-region-chooser"><label htmlFor="pd-region">Region</label><div className="pd-region-select"><Icon kind="globe"/><select id="pd-region" value={region} onChange={e=>setRegion(e.target.value)}><option value="ALL">All regions</option>{regions.map(r=><option key={r} value={r}>{r}</option>)}</select><span aria-hidden="true">⌄</span></div></div>
  <div className="pd-notice"><Icon kind="info"/><p><strong>Important Notice:</strong> This is a simulated marketplace with fictional digital keys. {platform==='GOG.com'?'This listing refers to GOG.com; it is not a Steam key.':`Activation instructions and region restrictions depend on the seller offer and platform (${activation}).`}</p></div>
  <section className="pd-offers-section"><h2>Recommended offers <span title="Offers with the lowest prices among the selected region"><Icon kind="info"/></span></h2>{error&&<p role="alert" className="form-error">{error}</p>}{recommended.length?<div className="pd-offers-list">{recommended.map((o,i)=>row(o,i,true))}</div>:<p className="pd-no-offers">No offers available for that region.</p>}</section>
  {rest.length>0&&<section className="pd-offers-section"><h2><span className="pd-green">{rest.length}</span> other offers</h2><div className="pd-offers-list">{listed.map((o,i)=>row(o,i,false))}</div>{rest.length>3&&<div className="pd-more"><button type="button" onClick={()=>setExpanded(v=>!v)}>{expanded?'Show fewer offers':`Load ${rest.length-3} more offers`}</button></div>}</section>}
  <section className="pd-description"><h2>About this game</h2><p>{product.description}</p><p>Digital product · {product.platform} · Region restrictions depend on the offer.</p></section>
 </div><aside className="pd-aside"><div className="pd-aside-sticky"><div className="pd-trust-heading"><span>Secure demo purchase</span><span aria-hidden="true">★★★★★</span></div><div className="pd-buy-box">{featured?<><span className="pd-aside-eyebrow">FEATURED OFFER</span><div className="pd-aside-price">{money(featured.priceCents,featured.currency)}</div><div className="pd-price-caveat">Demo price · No real payment <Icon kind="info"/></div>{product.cashbackPercent>0&&<p className="pd-aside-cashback">{product.cashbackPercent}% demo cashback <small>Illustrative: {cashback(featured.priceCents)}</small></p>}<button type="button" className="pd-paypal" disabled={busy} onClick={()=>fakePayPal(featured.id)}>PayPal <small>(demo)</small></button><div className="pd-side-buttons"><button type="button" className="pd-buy-yellow" disabled={busy} onClick={()=>putInCart(featured.id)}>{busy?'Adding…':'Buy now'}</button><button type="button" className="pd-side-cart" disabled={busy} title="Add to cart" aria-label="Add featured offer to cart" onClick={()=>putInCart(featured.id)}><Icon kind="cart"/></button></div><div className="pd-offer-footer"><button type="button" onClick={()=>document.getElementById('pd-region')?.focus()}>{rest.length+recommended.length-1} other offers from {money(eligible[1]?.priceCents??featured.priceCents,featured.currency)} <span>⌄</span></button></div></>:<div className="pd-no-offers">No available offer in this region.</div>}</div><div className="pd-checkout-safe"><h3>Safe Checkout Guaranteed</h3><div className="pd-payment-methods"><span>VISA</span><span>Mastercard</span><span>PayPal</span><span>Apple Pay</span></div><p>Payment simulation only. No third-party verification, endorsement or real payment processing is claimed.</p>{authenticated?<button type="button" onClick={onCart}>View your cart →</button>:<button type="button" onClick={onSignIn}>Sign in to purchase →</button>}</div></div></aside></div>;
}
