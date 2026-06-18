export const REGISTER_PAGE_URL =
  'https://clickrmedia.sharepoint.com/sites/trc-central/SitePages/Register.aspx';

function parseEmailParam(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }

  const email = raw.trim().replace(/^["']+|["']+$/g, '');
  if (!email || email.indexOf('@') === -1) {
    return undefined;
  }

  return email;
}

/** Email from ?email=... on the current page (e.g. returning from Register.aspx). */
export function getEmailFromUrl(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return parseEmailParam(new URLSearchParams(window.location.search).get('email') || undefined);
}

/**
 * Email used for Users list lookup and registration redirect.
 * Priority: ?email= URL param → signed-in SharePoint user → debug ?user= (if provided).
 */
export function resolveActiveUserEmail(loginEmail: string, debugUserEmail?: string): string {
  return getEmailFromUrl() || loginEmail.trim() || debugUserEmail || '';
}

/** True when ?noredirect is present (e.g. ?noredirect or ?noredirect=true). */
export function isNoRedirectFromUrl(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  if (!params.has('noredirect')) {
    return false;
  }

  const value = (params.get('noredirect') || '').trim().toLowerCase();
  return value === '' || value === 'true' || value === '1' || value === 'yes';
}

/**
 * On successful game load: set ?env=WebView and remove any stray ?noredirect.
 * Only call when the user did not explicitly open the page with ?noredirect.
 */
export function syncGamePageUrlParams(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  params.delete('noredirect');
  params.set('env', 'WebView');

  const query = params.toString();
  const newUrl = query
    ? `${window.location.pathname}?${query}${window.location.hash}`
    : `${window.location.pathname}${window.location.hash}`;

  window.history.replaceState(null, '', newUrl);
}

/** Build Register.aspx URL with email and all other query params from the current page. */
export function buildRegisterPageUrl(email: string = ''): string {
  const params = new URLSearchParams(window.location.search);
  params.set('email', email);
  params.delete('noredirect');
  params.set('env', 'WebView');

  const query = params.toString();
  return query ? `${REGISTER_PAGE_URL}?${query}` : REGISTER_PAGE_URL;
}

export function redirectToRegisterPage(email: string = ''): void {
  window.location.assign(buildRegisterPageUrl(email));
}
