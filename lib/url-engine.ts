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
  // We use the URL object to strip existing hash/search and ensure a clean base
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  
  // Remove trailing slash from base to avoid double slashes (e.g. .com//)
  const baseUrl = url.toString().replace(/\/$/, '');
  
  // Force the /#/c format which is standard for HashRouter
  return `${baseUrl}/#/c?d=${compressed}`;
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