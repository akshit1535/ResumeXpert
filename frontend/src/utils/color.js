const toHex = (color) => {
  if (!color) return null;

  // If already hex
  if (color.startsWith('#')) return color;

  // If OKLCH → convert manually
  if (color.startsWith('oklch')) {
    try {
      const match = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
      if (match) {
        const L = parseFloat(match[1]);   // 0 → 1
        const C = parseFloat(match[2]);   // 0 → 0.5 ish
        const H = parseFloat(match[3]);   // 0 → 360

        // Convert OKLCH → sRGB
        const hRad = (H * Math.PI) / 180;
        const a = C * Math.cos(hRad);
        const b = C * Math.sin(hRad);

        // oklab → linear RGB
        const L2 = L;
        const m1 = L2 + 0.3963377774 * a + 0.2158037573 * b;
        const m2 = L2 - 0.1055613458 * a - 0.0638541728 * b;
        const m3 = L2 - 0.0894841775 * a - 1.2914855480 * b;

        const m1_3 = m1 ** 3;
        const m2_3 = m2 ** 3;
        const m3_3 = m3 ** 3;

        let r =  4.0767416621 * m1_3 - 3.3077115913 * m2_3 + 0.2309699292 * m3_3;
        let g = -1.2684380046 * m1_3 + 2.6097574011 * m2_3 - 0.3413193965 * m3_3;
        let b2 = -0.0041960863 * m1_3 - 0.7034186147 * m2_3 + 1.7076147010 * m3_3;

        // Clamp
        r = Math.max(0, Math.min(1, r));
        g = Math.max(0, Math.min(1, g));
        b2 = Math.max(0, Math.min(1, b2));

        // Convert to hex
        const R = Math.round(r * 255).toString(16).padStart(2, '0');
        const G = Math.round(g * 255).toString(16).padStart(2, '0');
        const B = Math.round(b2 * 255).toString(16).padStart(2, '0');

        return `#${R}${G}${B}`;
      }
    } catch (e) {
      console.warn("Bad OKLCH parse", color, e);
    }
  }

  // Convert normal rgb/rgba → hex
  const temp = document.createElement('div');
  temp.style.color = color;
  document.body.appendChild(temp);
  const computed = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);

  const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = (+match[1]).toString(16).padStart(2, '0');
    const g = (+match[2]).toString(16).padStart(2, '0');
    const b = (+match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  return null;
};

export const fixTailwindColors = (element) => {
  const clone = element.cloneNode(true);
  
  // Process the root element
  const rootComputed = window.getComputedStyle(element);
  const rootBgColor = toHex(rootComputed.backgroundColor);
  if (rootBgColor && rootBgColor !== '#000000') {
    clone.style.backgroundColor = rootBgColor;
  }
  clone.style.color = '#000000';
  
  // Process all child elements
  const originalElements = element.querySelectorAll('*');
  const clonedElements = clone.querySelectorAll('*');

  clonedElements.forEach((el, index) => {
    const original = originalElements[index];
    const computed = window.getComputedStyle(original);

    // Convert and apply colors
    const bgColor = toHex(computed.backgroundColor);
    const borderColor = toHex(computed.borderColor);

    if (bgColor && bgColor !== '#000000' && bgColor !== 'rgba(0, 0, 0, 0)') {
      el.style.backgroundColor = bgColor;
    }
    if (borderColor && borderColor !== '#000000') {
      el.style.borderColor = borderColor;
    }

    // Force text to black for readability
    el.style.color = '#000000';
  });

  return clone;
};
