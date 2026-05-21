import { Resend } from 'resend';
import { generateLicenseKey } from '../../lib/license';

const resend = new Resend(process.env.RESEND_API_KEY);

async function getPayPalToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');
  const base = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return { token: data.access_token, base };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { orderID, buyerEmail } = req.body;
  if (!orderID || !buyerEmail) return res.status(400).json({ error: 'Missing fields' });
  try {
    const { token, base } = await getPayPalToken();
    const capture = await fetch(`${base}/v2/checkout/or
cat > pages/index.js << 'ENDOFFILE'
import { useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

const PREVIEW = [1,2,3,4,5,6].map(i => `/images/p${i}.jpeg`);

export default function Home() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [step, setStep] = useState('idle');
  const [licenseKey, setLicenseKey] = useState('');
  const [rendered, setRendered] = useState(false);

  function validateEmail(e) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setEmailError('Please enter a valid email.');
      return false;
    }
    setEmailError('');
    return true;
  }

  function initPayPal() {
    if (!validateEmail(email)) return;
    if (rendered) return;
    setStep('paying');
    setTimeout(() => {
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
        createOrder: async () => {
          const res = await fetch('/api/create-order', { method: 'POST' });
          const data = await res.json();
          return data.orderID;
        },
        onApprove: async (data) => {
          const res = await fetch('/api/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: data.orderID, buyerEmail: email }),
          });
          const result = await res.json();
          if (result.success) { setLicenseKey(result.licenseKey); setStep('success'); }
          else setStep('error');
        },
        onError: () => setStep('error'),
        onCancel: () => { setStep('idle'); setRendered(false); },
      }).render('#paypal-button-container');
      setRendered(true);
    }, 300);
  }

  return (
    <>
      <Head>
        <title>TSP World - Premium Screenshot Pack</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
        strategy="lazyOnload"
      />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0a0a;color:#ccd6f6;font-family:'Helvetica Neue',Arial,sans-serif}
        nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;border-bottom:1px solid #1d2d50}
        .logo{font-size:22px;font-weight:900;letter-spacing:4px}.logo span{color:#e94560}
        .badge{background:#e94560;color:#fff;font-size:11px;padding:4px 12px;border-radius:20px;font-weight:700}
        .hero{text-align:center;padding:80px 20px 60px}
        .tag{display:inline-block;background:#112240;border:1px solid #e94560;color:#e94560;font-size:11px;letter-spacing:3px;padding:6px 16px;border-radius:20px;margin-bottom:24px}
        h1{font-size:clamp(36px,6vw,72px);font-weight:900;line-height:1.1;max-width:800px;margin:0 auto 20px}
        h1 span{color:#e94560}
        .sub{color:#8892b0;font-size:18px;max-width:520px;margin:0 auto;line-height:1.6}
        .preview{padding:0 20px 80px;max-width:1100px;margin:0 auto}
        .slabel{text-align:center;color:#8892b0;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:24px}
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        @media(max-width:600px){.grid{grid-template-columns:repeat(2,1fr)}}
        .grid img{width:100%;border-radius:10px;border:1px solid #1d2d50;object-fit:cover;aspect-ratio:4/3;transition:.25s}
        .grid img:hover{transform:scale(1.03);border-color:#e94560}
        .more{text-align:center;margin-top:16px;color:#8892b0;font-size:14px}
        .more strong{color:#e94560}
        .buy{max-width:520px;margin:0 auto 80px;padding:0 20px}
        .card{background:#112240;border:1px solid #1d2d50;border-radius:20px;padding:48px 40px;text-align:center}
        @media(max-width:500px){.card{padding:32px 24px}}
        .price{font-size:72px;font-weight:900;color:#fff;line-height:1}
        .price sup{font-size:28px;color:#e94560;vertical-align:super}
        .pnote{color:#8892b0;font-size:13px;margin-bottom:32px}
        ul{list-style:none;text-align:left;margin-bottom:32px}
        li{display:flex;align-items:center;gap:10px;padding:8px 0;color:#8892b0;font-size:14px;border-bottom:1px solid #1d2d50}
        li:last-child{border-bottom:none}
        li::before{content:'v';color:#e94560;font-weight:900}
        label{display:block;text-align:left;font-size:13px;color:#8892b0;margin-bottom:8px;letter-spacing:1px;text-transform:uppercase}
        input{width:100%;background:#0a0a0a;border:2px solid #1d2d50;border-radius:10px;padding:14px 16px;color:#ccd6f6;font-size:15px;outline:none;transition:.2s;margin-bottom:4px}
        input:focus{border-color:#e94560}
        .err{color:#e94560;font-size:12px;margin-bottom:16px;text-align:left}
        .btn{width:100%;margin-top:20px;background:linear-gradient(135deg,#e94560,#c62a47);color:#fff;border:none;border-radius:10px;padding:16px;font-size:17px;font-weight:800;cursor:pointer;letter-spacing:1px}
        .secure{display:flex;align-items:center;justify-content:center;gap:6px;color:#4a5568;font-size:12px;margin-top:16px}
        .scard{background:#0d2137;border:2px solid #e94560;border-radius:20px;padding:48px 32px;text-align:center}
        .key{background:#0a0a0a;border:1px solid #e94560;border-radius:10px;padding:20px;font-family:monospace;font-size:24px;font-weight:900;color:#e94560;letter-spacing:6px;margin-bottom:28px}
        .abtn{display:inline-block;background:linear-gradient(135deg,#e94560,#c62a47);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:800;font-size:15px}
        footer{text-align:center;padding:32px;border-top:1px solid #1d2d50;color:#4a5568;font-size:12px}
      `}</style>

      <nav>
        <div className="logo">TSP<span>.</span>WORLD</div>
        <div className="badge">ONLY $2</div>
      </nav>

      <div className="hero">
        <div className="tag">Premium Digital Pack</div>
        <h1>20 Screenshots.<br /><span>One Price.</span><br />Forever Yours.</h1>
        <p className="sub">High-quality screenshot pack. Pay once, download all 20 images instantly.</p>
      </div>

      <div className="preview">
        <div className="slabel">Preview - 6 of 20</div>
        <div className="grid">
          {PREVIEW.map((src,i) => <img key={i} src={src} alt={`Preview ${i+1}`} loading="lazy" />)}
        </div>
        <div className="more">+ <strong>14 more</strong> exclusive screenshots included</div>
      </div>

      <div className="buy">
        {step === 'success' ? (
          <div className="scard">
            <div style={{fontSize:48,marginBottom:16}}>!</div>
            <h2 style={{marginBottom:12}}>Payment Successful!</h2>
            <p style={{color:'#8892b0',marginBottom:24}}>Check your email - your license key has been sent.</p>
            <div className="key">{licenseKey}</div>
            <a href={`/unlock?key=${licenseKey}`} className="abtn">Access My Pack Now</a>
          </div>
        ) : step === 'error' ? (
          <div className="card">
            <h2 style={{marginBottom:12}}>Something went wrong</h2>
            <button className="btn" onClick={() => { setStep('idle'); setRendered(false); }}>Try Again</button>
          </div>
        ) : (
          <div className="card">
            <div className="price"><sup>$</sup>2</div>
            <div className="pnote">one-time payment - instant delivery</div>
            <ul>
              <li>20 high-quality screenshots</li>
              <li>Instant email delivery</li>
              <li>License key - access forever</li>
              <li>No account required</li>
              <li>Secure PayPal checkout</li>
            </ul>
            {step === 'idle' && (
              <>
                <label>Your Email Address</label>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => email && validateEmail(email)} />
                {emailError && <div className="err">{emailError}</div>}
                <button className="btn" onClick={initPayPal}>Buy Now for $2</button>
              </>
            )}
            {step === 'paying' && <div id="paypal-button-container" />}
            <div className="secure">Secured by PayPal - SSL Encrypted</div>
          </div>
        )}
      </div>
      <footer>2026 TSP World - All rights reserved</footer>
    </>
  );
}
ENDOFFILE
cat > pages/unlock.js << 'ENDOFFILE'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const IMAGES = Array.from({ length: 20 }, (_, i) => `/images/p${i+1}.jpeg`);

export default function Unlock() {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (router.query.key) setKey(router.query.key);
  }, [router.query]);

  function handleUnlock(e) {
    e.preventDefault();
    if (/^TSP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key.trim())) {
      setUnlocked(true); setError('');
    } else {
      setError('Invalid license key. Please check your email.');
    }
  }

  return (
    <>
      <Head><title>Unlock - TSP World</title></Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0a0a;color:#ccd6f6;font-family:'Helvetica Neue',sans-serif;min-height:100vh}
        .page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px}
        .logo{font-size:28px;font-weight:900;letter-spacing:4px;margin-bottom:48px}
        .logo span{color:#e94560}
        .card{background:#112240;border:1px solid #1d2d50;border-radius:16px;padding:48px 40px;width:100%;max-width:480px;text-align:center}
        h1{font-size:22px;font-weight:700;margin-bottom:12px}
        p{color:#8892b0;font-size:14px;margin-bottom:32px;line-height:1.6}
        input{width:100%;background:#0a0a0a;border:2px solid #1d2d50;border-radius:8px;padding:14px 18px;color:#ccd6f6;font-size:18px;letter-spacing:4px;text-align:center;font-family:'Courier New',monospace;outline:none;transition:.2s}
        input:focus{border-color:#e94560}
        button{width:100%;margin-top:20px;background:linear-gradient(135deg,#e94560,#c62a47);color:#fff;border:none;border-radius:8px;padding:14px;font-size:15px;font-weight:700;cursor:pointer}
        .err{color:#e94560;font-size:13px;margin-top:12px}
        .gallery{width:100%;max-width:1200px;margin-top:48px}
        .gallery h2{font-size:20px;font-weight:700;margin-bottom:24px;text-align:center}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
        .grid a img{width:100%;border-radius:10px;border:1px solid #1d2d50;transition:.2s;cursor:pointer;display:block}
        .grid a img:hover{transform:scale(1.03);border-color:#e94560}
      `}</style>
      <div className="page">
        <div className="logo">TSP<span>.</span>WORLD</div>
        {!unlocked ? (
          <div className="card">
            <h1>Enter Your License Key</h1>
            <p>Check your email for the license key you received after purchase.</p>
            <form onSubmit={handleUnlock}>
              <input type="text" placeholder="TSP-XXXX-XXXX-XXXX"
                value={key} onChange={e => setKey(e.target.value.toUpperCase())} maxLength={19} />
              <button type="submit">Unlock My Pack</button>
              {error && <div className="err">{error}</div>}
            </form>
          </div>
        ) : (
          <div className="gallery">
            <h2>Unlocked - {IMAGES.length} Screenshots</h2>
            <div className="grid">
              {IMAGES.map((src,i) => (
                <a key={i} href={src} download target="_blank" rel="noreferrer">
                  <img src={src} alt={`Screenshot ${i+1}`} loading="lazy" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
ENDOFFILE
cat > .env.local << 'EOF'
PAYPAL_CLIENT_ID=ASzRV-VhDJQj0P_BGp1juOmGzp8JPK_scGKRgxa5Ju0rTXDxVNmI1V5SyrPjgeXi_pBRkr1wKa2pnjGy
PAYPAL_CLIENT_SECRET=EN-d0cUS-mQFXWjUEuKdPoTpyTdQPviNpsiixhcb-3EntAcvLlLIjZJnBbzIYYkAQ0s83tRXATbqAs16
PAYPAL_MODE=sandbox
RESEND_API_KEY=re_DnCv3aTH_6gwcSgUcvkSZs7e3YHGdBBzD
NEXT_PUBLIC_PAYPAL_CLIENT_ID=ASzRV-VhDJQj0P_BGp1juOmGzp8JPK_scGKRgxa5Ju0rTXDxVNmI1V5SyrPjgeXi_pBRkr1wKa2pnjGy
NEXT_PUBLIC_SITE_URL=https://tsp-world.vercel.app
PRODUCT_PRICE=2.00
