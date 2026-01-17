import LZString from 'lz-string';
import { StoreData } from '../types';

// The "Zero Backend" Magic
// We compress the entire store state into a URL parameter.

export const generateStoreLink = (data: StoreData): string => {
  // 1. Minify data to save space (map to array)
  const jsonString = JSON.stringify(data);
  
  // 2. Compress
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  
  // 3. Construct URL robustly
  // We use the origin + pathname to ensure we don't duplicate hashes
  const baseUrl = window.location.origin + window.location.pathname;
  
  // Ensure we don't have trailing slashes that break the hash
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Force the /#/c format which is standard for HashRouter in this app
  return `${cleanBase}/#/c?d=${compressed}`;
};

export const decodeStoreData = (compressedString: string): StoreData | null => {
  try {
    if (!compressedString) return null;
    const decompressed = LZString.decompressFromEncodedURIComponent(compressedString);
    if (!decompressed) return null;
    return JSON.parse(decompressed) as StoreData;
  } catch (e) {
    console.error("Failed to parse store data", e);
    return null;
  }
};