export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tech: string[];
  themeColor: string; // Hex or HSL color for accents
  gradient: string; // CSS background gradient
  particleType: 'rain' | 'sparkles' | 'grid' | 'lasers';
  url: string;
}

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}
