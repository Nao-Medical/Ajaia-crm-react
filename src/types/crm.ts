import type { DataSource } from "../services/apiService";

export interface CompanyData {
  name: string;
  type?: string;
  subtype?: string;
  aum?: string;
  street1?: string;
  street2?: string;
  address?: string;
  city?: string;
  city_full?: string;
  phone?: string;
  state?: string;
  postalCode?: string;
  zipCode?: string;
  country?: string;
  mainPhone?: string;
  website?: string;
}

export interface CrmData {
  name?: string;
  type?: string;
  subtype?: string;
  aum?: string;
  address?: string;
  city_full?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  website?: string;
  companyName?: string;
}

export type Contact = {
  id: string;
  source: DataSource | DataSource[];      // <-- allow array for merging

  // Names & title
  name?: string;
  firstName?: string;
  lastName?: string;
  title?: string;

  // Coordinates
  email?: string;
  phone?: string;

  // Location
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;

  // Meta
  category?: string;
  sourceTag?: string | string[];          // <-- allow array for merging
  linkedInUrl?: string;
  dear?: string;
  companyName?: string;
};

export interface MergedContact {
  preqinContact: Contact | null;
  dakotaContact: Contact | null;
  pitchbookContact: Contact | null;
  zoomInfoContact: Contact | null;
  crmContact: Contact | null;
  dataSource: string;
  index: number;
}
