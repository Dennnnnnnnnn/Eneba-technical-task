import {useEffect, useMemo, useState} from 'react';
import type {Offer, Product} from './api';
import {getFavorites,setFavorite} from './api';
import './product-page.css';
import {HeartIcon,CartIcon} from './UiIcons';

const money=(cents:number,currency='EUR')=>new Intl.NumberFormat('en-IE',{style:'currency',currency}).format(cents/100);

function Icon({kind}:{kind:'check'|'key'|'refund'|'desktop'|'globe'|'cart'|'heart'|'info'|'star'}){
 const common={viewBox:'0 0 24 24',width:24,height:24,fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true as const};
 if(kind==='check')return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="m6.5 12 3.5 3.5 7.5-8"/></svg>;
 if(kind==='key')return <svg viewBox="0 0 42 42" width="42" height="41.99" className="mj6tQW pd-feature-icon pd-feature-icon-key" aria-hidden="true"><ellipse cx="2.46" cy="2.95" rx="2.46" ry="2.95" fill="currentColor" transform="translate(27.52 8.85)"></ellipse><path d="M41.55 13.6a23.93 23.93 0 00-5.16-8.1A23.38 23.38 0 0028.33.42a6.6 6.6 0 00-7 1.49L14.9 8.33a6.57 6.57 0 00-1.37 7.28c.34.76.7 1.5 1.1 2.22L.48 31.97A1.64 1.64 0 000 33.13v7.22A1.64 1.64 0 001.64 42h7.22a1.64 1.64 0 001.64-1.64V37.4h2.95a1.64 1.64 0 001.64-1.65V32.8h2.96a1.64 1.64 0 100-3.28h-4.6a1.64 1.64 0 00-1.64 1.64v2.95H8.86a1.64 1.64 0 00-1.64 1.65v2.95H3.28v-4.9l14.55-14.55a1.64 1.64 0 00.24-2.01 26.55 26.55 0 01-1.55-2.98 3.27 3.27 0 01.69-3.62l6.44-6.4a3.31 3.31 0 013.5-.75 20.09 20.09 0 016.92 4.32 20.64 20.64 0 014.42 6.99 3.26 3.26 0 01-.73 3.5l-6.52 6.49a3.3 3.3 0 01-3.61.7 21.3 21.3 0 01-2.96-1.51 1.64 1.64 0 00-1.71 2.8 24.59 24.59 0 003.4 1.74 6.58 6.58 0 007.2-1.4l6.51-6.5a6.54 6.54 0 001.48-7.02z" fill="currentColor"></path></svg>;
 if(kind==='refund')return <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" className="mj6tQW pd-feature-icon pd-feature-icon-refund" aria-hidden="true"><path d="M1 15.399v9.6M1 23.399h17.599a3.2 3.2 0 0 0-3.2-3.2h-4a3.2 3.2 0 0 0-3.2-3.2H1M7.4 20.198h4M19.508 4.978h-2.315a1.483 1.483 0 0 0-1.525 1.44 1.44 1.44 0 0 0 .96 1.334l2.346.896a1.44 1.44 0 0 1 .96 1.333 1.483 1.483 0 0 1-1.525 1.44h-2.314M17.8 4.979V3.667M17.8 12.733V11.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M10.6 8.2a7.2 7.2 0 1 0 14.4 0 7.2 7.2 0 0 0-14.4 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
 if(kind==='desktop')return <svg {...common}><rect x="2" y="4" width="20" height="14" rx="1"/><path d="M8 22h8m-4-4v4"/></svg>;
 if(kind==='globe')return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c-6 6-6 14 0 20 6-6 6-14 0-20"/></svg>;
 if(kind==='heart')return <HeartIcon/>;
 if(kind==='cart')return <CartIcon width={16} height={16}/>;
 if(kind==='star')return <svg {...common} fill="currentColor" stroke="none"><path d="m12 2 3.1 6.4 7.1 1-5.1 5 .9 7.1-6-3.3-6 3.3 1.1-7.1-5.2-5 7.1-1Z"/></svg>;
 return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="M12 10v7M12 6.5v.2"/></svg>;
}

function ActivationPlatformIcon({platform,title}:{platform:string;title:string}){
 const t=title.toLowerCase();
 const filename=t.includes('steam')?'steam':t.includes('roblox')?'':t.includes('gog')?'':platform==='PlayStation'?'psn':platform==='Xbox'?'xbox':platform==='Switch'?'nintendo':platform==='PC'?'steam':'';
 if(filename)return <img className="pd-activation-logo" src={`/shortcut-icons/${filename}.svg`} alt="" aria-hidden="true"/>;
 if(platform==='PC')return <Icon kind="desktop"/>;
 return <Icon kind="key"/>;
}
type Props={product:Product;offers:Offer[];busy:boolean;error:string;onAdd:(id:number)=>void;onCart:()=>void;onSignIn:()=>void;authenticated:boolean;onNotice:(message:string)=>void};
export default function ProductDetail({product,offers,busy,error,onAdd,onCart,onSignIn,authenticated,onNotice}:Props){
 const sorted=useMemo(()=>[...offers].sort((a,b)=>a.priceCents-b.priceCents),[offers]);
 const regions=useMemo(()=>Array.from(new Set(sorted.map(o=>o.region))).sort(),[sorted]);
 const [region,setRegion]=useState('ALL');
 const [expanded,setExpanded]=useState(false);
 const [wishlist,setWishlist]=useState(false);
 const [favoriteCount,setFavoriteCount]=useState<number|null>(null);
 const [favoriteBusy,setFavoriteBusy]=useState(false);
 useEffect(()=>{
  const controller=new AbortController();
  setRegion('ALL');setExpanded(false);setWishlist(false);setFavoriteCount(null);
  getFavorites(product.slug,controller.signal).then(result=>{if(!controller.signal.aborted){setWishlist(result.saved);setFavoriteCount(result.count)}}).catch(()=>{if(!controller.signal.aborted)onNotice('Could not load favorites')});
  return()=>controller.abort();
 },[product.slug,authenticated]);
 async function toggleFavorite(){
  if(!authenticated){onSignIn();return}
  if(favoriteBusy)return;setFavoriteBusy(true);
  try{const state=await setFavorite(product.slug,!wishlist);setWishlist(state.saved);setFavoriteCount(state.count)}
  catch{onNotice('Could not update favorites')}finally{setFavoriteBusy(false)}
 }
 const eligible=sorted.filter(o=>region==='ALL'||o.region===region);
 const recommended=eligible.slice(0,2);
 const rest=eligible.slice(2);
 const listed=expanded?rest:rest.slice(0,3);
 const featured=recommended[0];
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
  <section className="pd-intro"><div className="pd-cover" style={{background:product.coverColor}}>{product.coverImageUrl?<img src={product.coverImageUrl} alt={`${product.title} game cover`}/>:<strong>{product.title}</strong>}</div><div className="pd-overview"><span className="pd-cashback-pill">Cashback deal</span><h1>{product.title}</h1><div className="pd-features"><div className="pd-feature"><Icon kind="check"/><div><strong>Can be activated in Lithuania*</strong><span>Check region restrictions</span></div></div><div className="pd-feature"><ActivationPlatformIcon platform={product.platform} title={product.title}/><div><strong>{activation}</strong><span>Check activation instructions</span></div></div><div className="pd-feature"><Icon kind="key"/><div><strong>Digital edition (CD-KEY)</strong><em>Delivery after demo checkout</em></div></div><div className="pd-feature"><Icon kind="refund"/><div><strong>Refund availability</strong><span>Demo purchases are nonredeemable; no payments taken</span></div></div></div><div className="pd-compat"><span><Icon kind="desktop"/> Works on: <strong>{product.platform==='PC'?'Windows':product.platform}</strong></span><button type="button" onClick={()=>onNotice('Detailed system requirements are not yet provided by the catalog API.')}>Check requirements</button></div><p className="pd-region-footnote">*Region compatibility is illustrative. Check the specific offer region before buying.</p></div><button type="button" className={`pd-favorite ${wishlist?'pd-favorite-active':''}`} aria-pressed={wishlist} aria-label={wishlist?'Remove from wishlist':'Add to wishlist'} disabled={favoriteBusy} onClick={toggleFavorite}><Icon kind="heart"/><span>{favoriteCount===null?"—":favoriteCount.toLocaleString()}</span></button></section>
  <div className="pd-region-chooser"><label htmlFor="pd-region">Region</label><div className="pd-region-select"><Icon kind="globe"/><select id="pd-region" value={region} onChange={e=>setRegion(e.target.value)}><option value="ALL">All regions</option>{regions.map(r=><option key={r} value={r}>{r}</option>)}</select><span aria-hidden="true">⌄</span></div></div>
  <div className="pd-notice"><Icon kind="info"/><p><strong>Important Notice:</strong> This is a simulated marketplace with fictional digital keys. {platform==='GOG.com'?'This listing refers to GOG.com; it is not a Steam key.':`Activation instructions and region restrictions depend on the seller offer and platform (${activation}).`}</p></div>
  <section className="pd-offers-section"><h2>Recommended offers <span title="Offers with the lowest prices among the selected region"><Icon kind="info"/></span></h2>{error&&<p role="alert" className="form-error">{error}</p>}{recommended.length?<div className="pd-offers-list">{recommended.map((o,i)=>row(o,i,true))}</div>:<p className="pd-no-offers">No offers available for that region.</p>}</section>
  {rest.length>0&&<section className="pd-offers-section"><h2><span className="pd-green">{rest.length}</span> other offers</h2><div className="pd-offers-list">{listed.map((o,i)=>row(o,i,false))}</div>{rest.length>3&&<div className="pd-more"><button type="button" onClick={()=>setExpanded(v=>!v)}>{expanded?'Show fewer offers':`Load ${rest.length-3} more offers`}</button></div>}</section>}
  <section className="pd-description"><h2>About this game</h2><p>{product.description}</p><p>Digital product · {product.platform} · Region restrictions depend on the offer.</p></section>
 </div><aside className="pd-aside"><div className="pd-aside-sticky"><div className="pd-trust-heading"><span>Secure demo purchase</span><span aria-hidden="true">★★★★★</span></div><div className="pd-buy-box">{featured?<><span className="pd-aside-eyebrow">FEATURED OFFER</span><div className="pd-aside-price">{money(featured.priceCents,featured.currency)}</div><div className="pd-price-caveat">Demo price · No real payment <Icon kind="info"/></div>{product.cashbackPercent>0&&<p className="pd-aside-cashback">{product.cashbackPercent}% demo cashback </p>}<button type="button" className="pd-paypal" disabled={busy} onClick={()=>fakePayPal(featured.id)}>PayPal <small>(demo)</small></button><div className="pd-side-buttons"><button type="button" className="pd-buy-yellow" disabled={busy} onClick={()=>putInCart(featured.id)}>{busy?'Adding…':'Buy now'}</button><button type="button" className="pd-side-cart" disabled={busy} title="Add to cart" aria-label="Add featured offer to cart" onClick={()=>putInCart(featured.id)}><Icon kind="cart"/></button></div><div className="pd-offer-footer"><button type="button" onClick={()=>document.getElementById('pd-region')?.focus()}>{rest.length+recommended.length-1} other offers from {money(eligible[1]?.priceCents??featured.priceCents,featured.currency)} <span>⌄</span></button></div></>:<div className="pd-no-offers">No available offer in this region.</div>}</div><div className="pd-checkout-safe"><h3>Safe Checkout Guaranteed</h3><div className="pd-payment-methods"><span>VISA</span><span>Mastercard</span><span>PayPal</span><span>Apple Pay</span></div><p>Payment simulation only. No third-party verification, endorsement or real payment processing is claimed.</p>{authenticated?<button type="button" onClick={onCart}>View your cart →</button>:<button type="button" onClick={onSignIn}>Sign in to purchase →</button>}</div></div></aside></div>;
}
