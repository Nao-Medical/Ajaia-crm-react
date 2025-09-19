// src/types/crm.ts

// A generic interface for the external data sources
export interface CompanyData {
    name: string;
    type?: string;
    subtype?: string;
    aum?: string; // Or number
    street1?: string;
    street2?: string;
    address?: string;
    // Full city name from Preqin
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

// Corrected CRM data interface to match its usage in the component.
// It uses different field names for addresses, phone, etc.
export interface CrmData {
    name?: string;      // Corresponds to 'Company Name'
    type?: string;      // Corresponds to 'Type'
    subtype?: string;   // Corresponds to 'Subtype'
    aum?: string;       // Corresponds to 'AUM'
    address?: string;
    city_full?: string;  // Corresponds to 'Street 1'
    address2?: string;  // Corresponds to 'Street 2'
    city?: string; // Corresponds to 'City'
    state?: string;     // Corresponds to 'State'
    zipCode?: string;   // Corresponds to 'Postal Code'
    country?: string;   // Corresponds to 'Country'
    phone?: string;     // Corresponds to 'Main Phone'
    website?: string;   // Corresponds to 'Website'
    // This field was used in the original ColumnSearch, but `name` is more consistent.
    // If you need both, you can keep it.
    companyName?: string;
}


export interface Contact {
    // Make sure your contact type has all necessary fields
    id?: string;
    contactId?: string;
    firstName: string;
    lastName: string;
    title?: string;
    email?: string;
    phone?: string;
    linkedIn?: string;
    // ... add any other fields
}

export interface MergedContact {
    preqinContact: Contact | null;
    dakotaContact: Contact | null;
    pitchbookContact: Contact | null;
    zoomInfoContact: Contact | null;
    crmContact: Contact | null;
    dataSource: string;
    index: number;
}