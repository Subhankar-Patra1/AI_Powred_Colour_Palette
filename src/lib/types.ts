export interface Color {
  hex: string;
  name: string;
}

export interface Palette {
  id: string;
  name?: string;
  colors: Color[];
  isAdjusted?: boolean; // Optional flag to indicate if palette was adjusted
}

export interface SavedColor extends Color {
  id: string; // Unique ID for the saved instance, e.g., timestamp or UUID
  savedAt: number;
}
