// src/types/crm.ts

export interface CompanyData {
    name: string;
    website?: string;
    industry?: string;
    // ... add other fields like address, phone, etc.
}

export interface CrmData {
    companyName: string;
    // ... add other CRM-specific fields
}

export interface Contact {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    title?: string;
}