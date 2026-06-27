const CHAR_WIDTH = 6.5;
const SEGMENT_PADDING = 20;
const HEIGHT = 20;

function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&apos;";
    }
  });
}

function segmentWidth(text: string): number {
  return Math.round(text.length * CHAR_WIDTH) + SEGMENT_PADDING;
}

export function renderBadge({ label, message, color }: { label: string; message: string; color: string }): string {
  const labelWidth = segmentWidth(label);
  const messageWidth = segmentWidth(message);
  const totalWidth = labelWidth + messageWidth;
  const labelCenter = labelWidth / 2;
  const messageCenter = labelWidth + messageWidth / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${HEIGHT}" role="img" aria-label="${escapeXml(label)}: ${escapeXml(message)}">
  <rect width="${labelWidth}" height="${HEIGHT}" fill="#0f172a"/>
  <rect x="${labelWidth}" width="${messageWidth}" height="${HEIGHT}" fill="${color}"/>
  <g font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" text-anchor="middle">
    <text x="${labelCenter}" y="14" fill="#ffffff">${escapeXml(label)}</text>
    <text x="${messageCenter}" y="14" fill="#ffffff" font-weight="bold">${escapeXml(message)}</text>
  </g>
</svg>`;
}
