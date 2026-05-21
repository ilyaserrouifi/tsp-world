import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const IMAGES = Array.from({ length: 20 }, (_, i) => `/images/p${i+1}.png`);

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
