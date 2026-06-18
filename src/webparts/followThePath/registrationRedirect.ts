export const REGISTER_PAGE_URL =
  'https://clickrmedia.sharepoint.com/sites/trc-central/SitePages/Register.aspx';

/** Build Register.aspx URL with all query params from the current page. */
export function buildRegisterPageUrl(): string {
  const search = window.location.search;

  if (!search || search.length <= 1) {
    return REGISTER_PAGE_URL;
  }

  const joiner = REGISTER_PAGE_URL.indexOf('?') >= 0 ? '&' : '?';
  return REGISTER_PAGE_URL + joiner + search.substring(1);
}

export function redirectToRegisterPage(): void {
  window.location.assign(buildRegisterPageUrl());
}
