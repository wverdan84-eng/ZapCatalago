export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string; 
  category?: string;
  stock?: number;
  available: boolean;
}

export interface StoreConfig {
  storeName: string;
  phone: string; // Formatting: 5511999999999
  currency: string;
  themeColor: string;
  logoUrl?: string;
  instagram?: string;
  address?: string;
  openTime?: string; // "09:00"
  closeTime?: string; // "18:00"
  allowPickup?: boolean;
  allowDelivery?: boolean;
}

export interface StoreData {
  config: StoreConfig;
  products: Product[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface LicenseData {
  email: string;
  expirationDate: number; // Timestamp
  signature: string;
}