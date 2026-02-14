/**
 * Frontend API client for AI Workshop CS backend.
 * Base URL auto-detects from window.location for dev + production.
 */

function getBaseUrl() {
  if (typeof window === 'undefined') return '';
  const { protocol, hostname } = window.location;
  // Dev: SvelteKit on 9347, API on 9793
  if (hostname === '127.0.0.1' || hostname === 'localhost') {
    return `${protocol}//${hostname}:9793`;
  }
  // Production: same origin, API behind reverse proxy
  return '';
}

/**
 * Submit user feedback.
 * @param {{ message: string, page_url?: string, feedback_type?: string, honeypot?: string, opened_at?: number }} request
 * @returns {Promise<{ success: boolean, message: string, beads_issue_id?: string, pii_redacted?: boolean }>}
 */
export async function submitFeedback(request) {
  const res = await fetch(`${getBaseUrl()}/api/feedback/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Something went wrong.' }));
    throw new Error(err.detail || `Error ${res.status}`);
  }

  return res.json();
}
