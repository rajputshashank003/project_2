export interface NgoConfig {
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
  signatureUrl?: string;
  presidentName: string;
  secretaryName: string;
  foundedYear: number;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy: string;
}
