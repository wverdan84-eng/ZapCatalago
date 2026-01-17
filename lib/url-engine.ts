import LZString from 'lz-string';
import { StoreData } from '../types';

// The "Zero Backend" Magic
// We compress the entire store state into a URL parameter.

export const generateStoreLink = (data: StoreData): string => {
  // 1. Minify data to save space (map to array)
  // Format: [version, config, products]
  // This is a simplified version. In prod, you map keys to shorter chars.
  const jsonString = JSON.stringify(data);
  
  // 2. Compress
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  
  // 3. Construct URL
  // In a real app, this would be your domain. Here we use the current host.
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#/c?d=${compressed}`;
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
