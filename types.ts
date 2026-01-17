export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string; // Optional: In a real PWA, would be base64 or external URL
  available: boolean;
}

export interface StoreConfig {
  storeName: string;
  phone: string; // Formatting: 5511999999999
  currency: string;
  themeColor: string;
}

export interface StoreData {
  config: StoreConfig;
  products: Product[];
}

export interface CartItem extends Product {
  quantity: number;
}
