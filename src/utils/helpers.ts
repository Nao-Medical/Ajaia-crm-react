// src/utils/helpers.ts
// import { type Contact, type MergedContact } from '../types/crm';

/**
 * Normalizes a string for comparison by converting to lowercase, trimming,
 * and removing special characters.
 */
const normalizeString = (val: any): string => {
    if (!val || val === 'N/A' || val === 'Not specified' || val === 'Not disclosed') return '';
    return String(val).toLowerCase().trim();
};

/**
 * Compares two values for mismatch detection.
 */
export const compareForMismatch = (valueA: any, valueB: any): boolean => {
    const normA = normalizeString(valueA);
    const normB = normalizeString(valueB);
    if (!normA || !normB) return false; // No mismatch if one is empty
    return normA !== normB;
};

// ... You can add your `formatAUM`, `formatNumber` functions here ...

/**
 * Your complex contact merging logic, now as a pure, testable function.
 */
// export const mergeAndMatchContacts = (
//     preqinContacts: Contact[],
//     dakotaContacts: Contact[],
//     pitchbookContacts: Contact[],
//     zoomInfoContacts: Contact[],
//     crmContacts: Contact[]
// ): MergedContact[] => {
//     // ... PASTE THE ENTIRE `mergeAndMatchContacts` FUNCTION LOGIC HERE ...
//     // IMPORTANT: Make sure to define the MergedContact type (see below)
//     const mergedContacts: MergedContact[] = [];
//     const usedPreqinIndices = new Set();
//     // ... etc. ...
//     return mergedContacts;
// };