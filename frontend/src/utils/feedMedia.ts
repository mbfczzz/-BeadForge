import type { FeedItemData, FeedMediaType } from '../api/community';

export interface FeedMockMedia {
  svg: string;
  aspectRatio: number;
  accent: string;
  type: FeedMediaType;
}

const PALETTES = [
  { bgFrom: '#EAF2FF', bgTo: '#CFE2FF', accent: '#5B7CFA', accentSoft: '#AFC4FF', panel: '#FFFFFF', panelSoft: '#F8FBFF' },
  { bgFrom: '#FFF4E7', bgTo: '#FFDDBD', accent: '#FF9B4A', accentSoft: '#FFD3A9', panel: '#FFFFFF', panelSoft: '#FFF8F1' },
  { bgFrom: '#FFF0F6', bgTo: '#FFD2E8', accent: '#FF5C99', accentSoft: '#FFB7D3', panel: '#FFFFFF', panelSoft: '#FFF8FB' },
  { bgFrom: '#EEF9FF', bgTo: '#D3EEFF', accent: '#2FA7FF', accentSoft: '#9DD9FF', panel: '#FFFFFF', panelSoft: '#F7FCFF' },
  { bgFrom: '#F5F2FF', bgTo: '#E0D7FF', accent: '#8A6BFF', accentSoft: '#C6B8FF', panel: '#FFFFFF', panelSoft: '#FAF8FF' },
  { bgFrom: '#ECFFF4', bgTo: '#D0F7E0', accent: '#35C685', accentSoft: '#A6E8C8', panel: '#FFFFFF', panelSoft: '#F7FFFB' },
];

const CACHE = new Map<number, FeedMockMedia>();

function getPalette(index: number) {
  return PALETTES[index % PALETTES.length];
}

function renderImageScene(width: number, height: number, accent: string, accentSoft: string) {
  return `
    <rect x="48" y="48" width="${width - 96}" height="${height - 96}" rx="42" fill="rgba(255,255,255,0.92)"/>
    <circle cx="${Math.round(width * 0.28)}" cy="${Math.round(height * 0.34)}" r="${Math.round(width * 0.11)}" fill="${accentSoft}" opacity="0.9"/>
    <path d="M96 ${height - 140} C ${Math.round(width * 0.28)} ${Math.round(height * 0.54)}, ${Math.round(width * 0.42)} ${Math.round(height * 0.74)}, ${Math.round(width * 0.56)} ${Math.round(height * 0.56)} S ${Math.round(width * 0.82)} ${Math.round(height * 0.72)}, ${width - 96} ${Math.round(height * 0.42)} L ${width - 96} ${height - 96} L 96 ${height - 96} Z" fill="${accent}" opacity="0.78"/>
    <circle cx="${Math.round(width * 0.7)}" cy="${Math.round(height * 0.28)}" r="${Math.round(width * 0.06)}" fill="#FFFFFF" opacity="0.75"/>
  `;
}

function renderVideoScene(width: number, height: number, accent: string, accentSoft: string, durationSec = 14) {
  const m = Math.floor(durationSec / 60);
  const s = `${durationSec % 60}`.padStart(2, '0');
  return `
    <rect x="44" y="44" width="${width - 88}" height="${height - 88}" rx="42" fill="rgba(15,23,42,0.22)"/>
    <rect x="64" y="64" width="${width - 128}" height="${height - 128}" rx="34" fill="rgba(255,255,255,0.88)"/>
    <rect x="96" y="${Math.round(height * 0.22)}" width="${width - 192}" height="${Math.round(height * 0.42)}" rx="28" fill="${accentSoft}" opacity="0.9"/>
    <circle cx="${Math.round(width * 0.5)}" cy="${Math.round(height * 0.43)}" r="${Math.round(width * 0.09)}" fill="rgba(255,255,255,0.94)"/>
    <polygon points="${Math.round(width * 0.48)},${Math.round(height * 0.39)} ${Math.round(width * 0.48)},${Math.round(height * 0.47)} ${Math.round(width * 0.56)},${Math.round(height * 0.43)}" fill="${accent}"/>
    <rect x="96" y="${height - 156}" width="${width - 192}" height="14" rx="7" fill="rgba(15,23,42,0.12)"/>
    <rect x="96" y="${height - 156}" width="${Math.round((width - 192) * 0.44)}" height="14" rx="7" fill="${accent}" opacity="0.88"/>
    <rect x="${width - 188}" y="${height - 118}" width="92" height="38" rx="19" fill="rgba(15,23,42,0.72)"/>
    <text x="${width - 142}" y="${height - 93}" text-anchor="middle" font-size="22" font-weight="700" fill="#FFFFFF">${m}:${s}</text>
  `;
}

function renderGifScene(width: number, height: number, accent: string, accentSoft: string) {
  return `
    <rect x="44" y="44" width="${width - 88}" height="${height - 88}" rx="42" fill="rgba(255,255,255,0.94)"/>
    <circle cx="${Math.round(width * 0.28)}" cy="${Math.round(height * 0.3)}" r="${Math.round(width * 0.12)}" fill="${accentSoft}" opacity="0.85"/>
    <circle cx="${Math.round(width * 0.7)}" cy="${Math.round(height * 0.66)}" r="${Math.round(width * 0.14)}" fill="${accent}" opacity="0.28"/>
    <path d="M120 ${Math.round(height * 0.66)} Q ${Math.round(width * 0.34)} ${Math.round(height * 0.4)}, ${Math.round(width * 0.52)} ${Math.round(height * 0.58)} T ${width - 120} ${Math.round(height * 0.38)}" stroke="${accent}" stroke-width="26" stroke-linecap="round" fill="none" opacity="0.72"/>
    <rect x="96" y="96" width="112" height="46" rx="23" fill="rgba(15,23,42,0.76)"/>
    <text x="152" y="126" text-anchor="middle" font-size="24" font-weight="800" fill="#FFFFFF">GIF</text>
    <rect x="${width - 178}" y="90" width="82" height="38" rx="19" fill="${accent}" opacity="0.92"/>
    <text x="${width - 137}" y="116" text-anchor="middle" font-size="19" font-weight="700" fill="#FFFFFF">LOOP</text>
  `;
}

export function getFeedMockMedia(feed: FeedItemData): FeedMockMedia {
  const cached = CACHE.get(feed.id);
  if (cached) return cached;

  const palette = getPalette(feed.id + feed.media.demoAssetId.length);
  const width = 1200;
  const height = Math.round(width / feed.media.aspectRatio);

  let scene = '';
  if (feed.media.type === 'video') {
    scene = renderVideoScene(width, height, palette.accent, palette.accentSoft, feed.media.durationSec);
  } else if (feed.media.type === 'gif') {
    scene = renderGifScene(width, height, palette.accent, palette.accentSoft);
  } else {
    scene = renderImageScene(width, height, palette.accent, palette.accentSoft);
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bg-${feed.id}" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${palette.bgFrom}" />
        <stop offset="1" stop-color="${palette.bgTo}" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" rx="44" fill="url(#bg-${feed.id})"/>
    <circle cx="${Math.round(width * 0.12)}" cy="${Math.round(height * 0.16)}" r="${Math.round(width * 0.14)}" fill="${palette.accent}" opacity="0.08"/>
    <circle cx="${Math.round(width * 0.84)}" cy="${Math.round(height * 0.22)}" r="${Math.round(width * 0.16)}" fill="${palette.accentSoft}" opacity="0.28"/>
    <circle cx="${Math.round(width * 0.84)}" cy="${Math.round(height * 0.84)}" r="${Math.round(width * 0.22)}" fill="${palette.accent}" opacity="0.08"/>
    ${scene}
  </svg>`;

  const result = {
    svg,
    aspectRatio: feed.media.aspectRatio,
    accent: feed.coverAccent || palette.accent,
    type: feed.media.type,
  };

  CACHE.set(feed.id, result);
  return result;
}
