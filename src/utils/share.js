/** Share URLs for high-traffic platforms (opens in new tab). */

export const SHARE_PLATFORMS = [
  {
    id: 'facebook',
    label: 'Facebook',
    buildUrl: ({ url }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'x',
    label: 'X',
    buildUrl: ({ url, title }) => {
      const params = new URLSearchParams({
        url,
        text: title,
      });
      return `https://twitter.com/intent/tweet?${params}`;
    },
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    buildUrl: ({ url }) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    buildUrl: ({ url, title }) => {
      const text = `${title} ${url}`;
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    },
  },
  {
    id: 'reddit',
    label: 'Reddit',
    buildUrl: ({ url, title }) => {
      const params = new URLSearchParams({ url, title });
      return `https://www.reddit.com/submit?${params}`;
    },
  },
  {
    id: 'email',
    label: 'Email',
    buildUrl: ({ url, title }) => {
      const params = new URLSearchParams({
        subject: title,
        body: url,
      });
      return `mailto:?${params}`;
    },
  },
];

export function canUseNativeShare() {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function'
  );
}

export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(input);
  return ok;
}
