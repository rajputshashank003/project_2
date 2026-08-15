export interface NgoConfig {
  id?: number;
  name: string;
  tagline: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  registrationNumber: string;
  upiId: string;
  upiName: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  signatureUrl?: string;
  presidentName: string;
  secretaryName: string;
  foundedYear: number;
  description?: string;
  mission?: string;
  vision?: string;
  managerPhone?: string;
  updatedAt?: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy: string;
}
