export interface Property {
  id: number;
  title: string;
  city: string;
  district: string;
  type: string;
  rooms: number;
  price: number;
  area: number;
  floor: number;
  totalFloors: number;
  balcony: boolean;
  terrace: boolean;
  parking: boolean;
  pets: boolean;
  conditioner: boolean;
  photos: string;
  description: string | null;
  address: string;
  createdAt: string;
}
