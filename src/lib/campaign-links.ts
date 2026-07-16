const SAFE_CAMPAIGN_LINK_PATTERN = /^(https?:\/\/|#)/i;

export function getSafeCampaignLink(link?: string | null): string | null {
  const trimmed = link?.trim() ?? "";
  if (!trimmed) return null;
  return SAFE_CAMPAIGN_LINK_PATTERN.test(trimmed) ? trimmed : null;
}

export function isSafeCampaignLink(link?: string | null): boolean {
  const trimmed = link?.trim() ?? "";
  return !trimmed || SAFE_CAMPAIGN_LINK_PATTERN.test(trimmed);
}