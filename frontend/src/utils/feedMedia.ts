import type { FeedItemData } from '../navigation/types';
import { ALL_PATTERNS } from '../components/common';

export interface FeedMockPhoto {
  xml: string;
  aspectRatio: number;
  accent: string;
}

const PALETTES = [
  { bgFrom: '#EEF4FF', bgTo: '#D7E7FF', accent: '#5B7CFA', accentSoft: '#AFC4FF', panel: '#FFFFFF', panelSoft: '#F8FBFF' },
  { bgFrom: '#FFF5EA', bgTo: '#FFE3C4', accent: '#FF9D4D', accentSoft: '#FFD2A8', panel: '#FFFFFF', panelSoft: '#FFF9F2' },
  { bgFrom: '#ECFFF7', bgTo: '#CFF7E2', accent: '#3CBF8A', accentSoft: '#9BE5C3', panel: '#FFFFFF', panelSoft: '#F4FFFA' },
  { bgFrom: '#F4F1FF', bgTo: '#E0D8FF', accent: '#8A74FF', accentSoft: '#C6BAFF', panel: '#FFFFFF', panelSoft: '#FAF8FF' },
  { bgFrom: '#FFF1F5', bgTo: '#FFD7E5', accent: '#FF6B9D', accentSoft: '#FFBAD0', panel: '#FFFFFF', panelSoft: '#FFF8FB' },
  { bgFrom: '#F4F9FF', bgTo: '#DCEFFF', accent: '#4D9FFF', accentSoft: '#B4D7FF', panel: '#FFFFFF', panelSoft: '#F8FCFF' },
];

const ASPECT_RATIOS = [1.08, 0.92, 1.16, 1.02, 0.86, 1.12];
const CACHE = new Map<number, FeedMockPhoto>();

function buildPatternDots(pattern: string[][], boxW: number, boxH: number) {
  const rows = pattern.length;
  const cols = Math.max(...pattern.map((row) => row.length));
  const step = Math.min(boxW / (cols + 1.8), boxH / (rows + 1.8));
  const radius = step * 0.36;
  const totalW = (cols - 1) * step + radius * 2;
  const totalH = (rows - 1) * step + radius * 2;
  const startX = (boxW - totalW) / 2 + radius;
  const startY = (boxH - totalH) / 2 + radius;

  return pattern.map((row, y) => row.map((color, x) => {
    if (color === 'transparent') {
      return '';
    }

    const cx = (startX + x * step).toFixed(2);
    const cy = (startY + y * step).toFixed(2);
    const r = radius.toFixed(2);
    const hr = Math.max(radius * 0.34, 1.4).toFixed(2);
    const hx = (startX + x * step - radius * 0.26).toFixed(2);
    const hy = (startY + y * step - radius * 0.28).toFixed(2);

    return [
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />`,
      `<circle cx="${hx}" cy="${hy}" r="${hr}" fill="#FFFFFF" opacity="0.24" />`,
    ].join('');
  }).join('')).join('');
}

export function getFeedMockPhoto(feed: FeedItemData): FeedMockPhoto {
  const cached = CACHE.get(feed.id);
  if (cached) {
    return cached;
  }

  const palette = PALETTES[feed.id % PALETTES.length];
  const aspectRatio = ASPECT_RATIOS[feed.id % ASPECT_RATIOS.length];
  const width = 1200;
  const height = Math.round(width / aspectRatio);
  const outerPad = Math.round(width * 0.065);
  const frameW = width - outerPad * 2;
  const frameH = height - outerPad * 2;
  const artW = Math.round(frameW * 0.44);
  const artH = Math.round(frameH * 0.68);
  const artX = Math.round(frameW - artW - width * 0.075);
  const artY = Math.round(height * 0.17);
  const radius = Math.round(width * 0.045);
  const pattern = ALL_PATTERNS[feed.patternIdx % ALL_PATTERNS.length];
  const dots = buildPatternDots(pattern, artW - 48, artH - 48);
  const badgeWidth = 208;
  const badgeHeight = 52;
  const titleLineWidth = Math.min(Math.round(frameW * 0.34), 360);
  const subLineWidth = Math.min(Math.round(frameW * 0.24), 280);
  const lineY = artY + artH + 74;

  const xml = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bg-${feed.id}" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${palette.bgFrom}" />
        <stop offset="1" stop-color="${palette.bgTo}" />
      </linearGradient>
      <linearGradient id="panel-${feed.id}" x1="${outerPad}" y1="${outerPad}" x2="${width - outerPad}" y2="${height - outerPad}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${palette.panel}" />
        <stop offset="1" stop-color="${palette.panelSoft}" />
      </linearGradient>
      <filter id="shadow-${feed.id}" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="24" stdDeviation="38" flood-color="${palette.accent}" flood-opacity="0.15" />
      </filter>
    </defs>

    <rect width="${width}" height="${height}" rx="${radius}" fill="url(#bg-${feed.id})" />
    <circle cx="${Math.round(width * 0.17)}" cy="${Math.round(height * 0.18)}" r="${Math.round(width * 0.15)}" fill="${palette.accent}" opacity="0.11" />
    <circle cx="${Math.round(width * 0.84)}" cy="${Math.round(height * 0.22)}" r="${Math.round(width * 0.17)}" fill="${palette.accentSoft}" opacity="0.45" />
    <circle cx="${Math.round(width * 0.92)}" cy="${Math.round(height * 0.88)}" r="${Math.round(width * 0.24)}" fill="${palette.accent}" opacity="0.08" />

    <g filter="url(#shadow-${feed.id})">
      <rect x="${outerPad}" y="${outerPad}" width="${frameW}" height="${frameH}" rx="${Math.round(width * 0.038)}" fill="url(#panel-${feed.id})" />
    </g>

    <rect x="${outerPad + 56}" y="${outerPad + 58}" width="${badgeWidth}" height="${badgeHeight}" rx="${badgeHeight / 2}" fill="${palette.accent}" opacity="0.12" />
    <rect x="${outerPad + 80}" y="${outerPad + 78}" width="${Math.round(badgeWidth * 0.58)}" height="12" rx="6" fill="${palette.accent}" opacity="0.72" />

    <rect x="${outerPad + 56}" y="${outerPad + 158}" width="${titleLineWidth}" height="34" rx="17" fill="${palette.accent}" opacity="0.18" />
    <rect x="${outerPad + 56}" y="${outerPad + 212}" width="${Math.round(titleLineWidth * 0.82)}" height="34" rx="17" fill="${palette.accent}" opacity="0.12" />
    <rect x="${outerPad + 56}" y="${outerPad + 292}" width="${subLineWidth}" height="16" rx="8" fill="#FFFFFF" opacity="0.8" />
    <rect x="${outerPad + 56}" y="${outerPad + 326}" width="${Math.round(subLineWidth * 1.18)}" height="16" rx="8" fill="#FFFFFF" opacity="0.58" />
    <rect x="${outerPad + 56}" y="${outerPad + 360}" width="${Math.round(subLineWidth * 0.9)}" height="16" rx="8" fill="#FFFFFF" opacity="0.44" />

    <g transform="translate(${artX} ${artY}) rotate(${feed.id % 2 === 0 ? -4 : 4} ${Math.round(artW / 2)} ${Math.round(artH / 2)})">
      <rect width="${artW}" height="${artH}" rx="42" fill="${palette.accent}" opacity="0.15" />
      <rect x="24" y="24" width="${artW - 48}" height="${artH - 48}" rx="34" fill="#FFFFFF" opacity="0.9" />
      <rect x="42" y="42" width="${artW - 84}" height="${artH - 84}" rx="28" fill="${palette.panelSoft}" />
      <g transform="translate(24 24)">
        ${dots}
      </g>
    </g>

    <rect x="${outerPad + 56}" y="${lineY}" width="${Math.round(frameW * 0.24)}" height="18" rx="9" fill="${palette.accent}" opacity="0.18" />
    <rect x="${outerPad + 56}" y="${lineY + 34}" width="${Math.round(frameW * 0.4)}" height="18" rx="9" fill="#FFFFFF" opacity="0.75" />
    <rect x="${outerPad + 56}" y="${lineY + 68}" width="${Math.round(frameW * 0.28)}" height="18" rx="9" fill="#FFFFFF" opacity="0.5" />
  </svg>`;

  const result = {
    xml,
    aspectRatio,
    accent: palette.accent,
  };

  CACHE.set(feed.id, result);
  return result;
}
