// Creem Subscription Integration
// Docs: https://docs.creem.io
//
// Setup:
// 1. Create a product in Creem dashboard (https://creem.io) — recurring, $9.99/month
// 2. Copy the product_id (prod_XXXX) and API key (creem_XXXX or creem_test_XXXX)
// 3. Add to your .env: VITE_CREEM_API_KEY and VITE_CREEM_PRODUCT_ID
//
// Note: For production, move the API call to a Firebase Cloud Function
// so the API key is not exposed in the frontend bundle.

const API_BASE = import.meta.env.VITE_CREEM_TEST_MODE === 'true'
  ? 'https://test-api.creem.io/v1'
  : 'https://api.creem.io/v1';

const API_KEY = import.meta.env.VITE_CREEM_API_KEY || '';
const PRODUCT_ID = import.meta.env.VITE_CREEM_PRODUCT_ID || '';

export async function createCheckout({ email, userId }) {
  if (!API_KEY || !PRODUCT_ID) {
    throw new Error('Creem API key or product ID not configured');
  }

  const successUrl = `${window.location.origin}?creem_success=1`;

  const res = await fetch(`${API_BASE}/checkouts`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: PRODUCT_ID,
      request_id: `coach_${userId}_${Date.now()}`,
      success_url: successUrl,
      customer: { email },
      metadata: { userId, app: 'firststep-coach' },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Checkout failed (${res.status})`);
  }

  return res.json();
}

export async function getSubscription(subscriptionId) {
  if (!API_KEY) throw new Error('Creem API key not configured');

  const res = await fetch(`${API_BASE}/subscriptions?subscription_id=${subscriptionId}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!res.ok) throw new Error(`Failed to get subscription (${res.status})`);
  return res.json();
}

export function isCreemConfigured() {
  return !!(API_KEY && PRODUCT_ID);
}
