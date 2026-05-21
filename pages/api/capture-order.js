import { Resend } from 'resend';
import { generateLicenseKey } from '../../lib/license';
const resend = new Resend(process.env.RESEND_API_KEY);
async function getPayPalToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const base = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const res = await fetch(`${base}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  const data = await res.json();
  return { token: data.access_token, base };
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { orderID, buyerEmail } = req.body;
  if (!orderID || !buyerEmail) return res.status(400).json({ error: 'Missing fields' });
  try {
    const { token, base } = await getPayPalToken();
    const capture = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    const captureData = await capture.json();
    if (captureData.status !== 'COMPLETED') return res.status(400).json({ error: 'Payment not completed' });
    const licenseKey = generateLicenseKey();
    await resend.emails.send({ from: 'TSP World <onboarding@resend.dev>', to: buyerEmail, subject: 'Your TSP World Pack is Ready!', html: `<div style="background:#0a0a0a;color:#ccd6f6;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto"><h1 style="color:#e94560">TSP.WORLD</h1><h2>Your pack is ready!</h2><div style="background:#112240;border:2px solid #e94560;border-radius:12px;padding:24px;text-align:center;margin:24px 0"><div style="font-size:28px;font-weight:900;color:#e94560;letter-spacing:6px;font-family:monospace">${licenseKey}</div></div><a href="${process.env.NEXT_PUBLIC_SITE_URL}/unlock?key=${licenseKey}" style="display:inline-block;background:#e94560;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700">Access My Pack</a></div>` });
    return res.status(200).json({ success: true, licenseKey });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
