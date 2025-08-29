export function generateCategoryPlaceholderSVG(name: string, width: number = 400, height: number = 300): string {
  // Encode the name for SVG text element
  const encodedName = name.replace(/[<>&'"]/g, (char) => {
    const entities: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;'
    };
    return entities[char];
  });

  // Calculate text position and size
  const fontSize = Math.min(width / 15, 24);
  const textWidth = name.length * fontSize * 0.6;
  const textX = (width - textWidth) / 2;
  const textY = height * 0.7;

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#EBF4FF;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#E0E7FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#F3E8FF;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="icon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4F46E5;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.1"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <!-- Decorative circles -->
      <circle cx="${width * 0.125}" cy="${height * 0.167}" r="${width * 0.05}" fill="#3B82F6" opacity="0.1"/>
      <circle cx="${width * 0.875}" cy="${height * 0.833}" r="${width * 0.075}" fill="#4F46E5" opacity="0.1"/>
      <circle cx="${width * 0.5}" cy="${height * 0.5}" r="${width * 0.1}" fill="#8B5CF6" opacity="0.1"/>
      
      <!-- Icon container -->
      <rect x="${width * 0.375}" y="${height * 0.25}" width="${width * 0.25}" height="${height * 0.267}" rx="${width * 0.04}" fill="url(#icon)" filter="url(#shadow)"/>
      
      <!-- Folder icon -->
      <path d="M${width * 0.425} ${height * 0.3} L${width * 0.475} ${height * 0.3} L${width * 0.5} ${height * 0.267} L${width * 0.575} ${height * 0.267} L${width * 0.575} ${height * 0.433} L${width * 0.425} ${height * 0.433} Z" fill="white" opacity="0.9"/>
      <rect x="${width * 0.425}" y="${height * 0.333}" width="${width * 0.15}" height="${height * 0.067}" fill="white" opacity="0.7"/>
      <rect x="${width * 0.425}" y="${height * 0.4}" width="${width * 0.15}" height="${height * 0.033}" fill="white" opacity="0.5"/>
      
      <!-- Category name -->
      <text x="${textX}" y="${textY}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="600" fill="#374151" text-anchor="start">
        ${encodedName}
      </text>
    </svg>
  `.trim();
}

export function getCategoryPlaceholderDataURL(name: string, width: number = 400, height: number = 300): string {
  const svg = generateCategoryPlaceholderSVG(name, width, height);
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
