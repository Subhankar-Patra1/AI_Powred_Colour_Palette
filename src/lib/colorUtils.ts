// src/lib/colorUtils.ts
'use client';

export interface RGB { r: number; g: number; b: number; }
export interface HSL { h: number; s: number; l: number; }

export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const componentToHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  s /= 100; l /= 100; h /= 360;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function adjustHsl(colorHex: string, hueDelta: number, saturationDelta: number, lightnessDelta: number): string {
  const rgb = hexToRgb(colorHex);
  if (!rgb) return colorHex;

  let hsl = rgbToHsl(rgb);

  hsl.h = (hsl.h + hueDelta) % 360;
  if (hsl.h < 0) hsl.h += 360;

  hsl.s = Math.max(0, Math.min(100, hsl.s + saturationDelta));
  hsl.l = Math.max(0, Math.min(100, hsl.l + lightnessDelta));

  const adjustedRgb = hslToRgb(hsl);
  return rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
}

// Temperature adjustment: positive makes warmer (more red/yellow), negative makes cooler (more blue)
// Delta is expected to be in a range like -50 to +50
export function adjustTemperature(colorHex: string, tempDelta: number): string {
  const rgb = hexToRgb(colorHex);
  if (!rgb) return colorHex;

  let { r, g, b } = rgb;
  
  const scale = 0.6; 
  const change = tempDelta * scale;

  if (tempDelta > 0) { // Warmer
    r = Math.min(255, r + change);
    b = Math.max(0, b - change * 0.75);
  } else { // Cooler
    b = Math.min(255, b - change); 
    r = Math.max(0, r + change * 0.75);
  }
  
  return rgbToHex(r, g, b);
}

// Helper function to determine if a color is light or dark
export function isLight(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6 && hex.length !== 3) return true; // default to light for invalid hex
  const r = parseInt(hex.length === 3 ? hex.substring(0,1).repeat(2) : hex.substring(0, 2), 16);
  const g = parseInt(hex.length === 3 ? hex.substring(1,2).repeat(2) : hex.substring(2, 4), 16);
  const b = parseInt(hex.length === 3 ? hex.substring(2,3).repeat(2) : hex.substring(4, 6), 16);
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
  return hsp > 127.5;
}

// Generate shades (lightness variations) of a color
export function generateShades(baseColor: {hex: string, name: string}, count: number = 9): Array<{hex: string, name: string}> {
  const shades: Array<{hex: string, name: string}> = [];
  const rgb = hexToRgb(baseColor.hex);
  if (!rgb) return [{...baseColor}];

  const baseHsl = rgbToHsl(rgb);

  // Ensure an odd number of shades to include the original
  const numShades = count % 2 === 0 ? count + 1 : count;
  const steps = Math.floor(numShades / 2);

  // Calculate lightness step, ensuring it doesn't make colors too white or too black quickly
  // Max change could be around 40-50% in either direction
  const maxLightnessChange = 45;
  const stepSize = maxLightnessChange / steps;

  // Darker shades
  for (let i = steps; i > 0; i--) {
    const newLightness = Math.max(5, baseHsl.l - i * stepSize); // Min lightness 5%
    const newRgb = hslToRgb({ ...baseHsl, l: newLightness });
    shades.push({ hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b), name: `${baseColor.name} (Darker ${i})` });
  }

  // Original color
  shades.push({ hex: baseColor.hex, name: baseColor.name });

  // Lighter shades
  for (let i = 1; i <= steps; i++) {
    const newLightness = Math.min(95, baseHsl.l + i * stepSize); // Max lightness 95%
    const newRgb = hslToRgb({ ...baseHsl, l: newLightness });
    shades.push({ hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b), name: `${baseColor.name} (Lighter ${i})` });
  }
  
  return shades;
}
