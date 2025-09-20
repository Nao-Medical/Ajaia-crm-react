// src/components/ContactView.tsx
import React, { useState } from 'react';
import { type DataSource, apiService } from '../services/apiService';
import { type Contact as OriginalContact } from '../types/crm';
import { FaLinkedin } from 'react-icons/fa';

type Contact = OriginalContact & {
  firstName?: string;
  lastName?: string;
  title?: string;
  source?: DataSource | DataSource[];
  sourceTag?: string | string[];
};

type MergedContact = Contact & {
  sourcesData: Partial<Record<DataSource, Contact>>;
};

interface ContactViewProps {
  contacts: Contact[];
  crmCompanyName: string;
}

const selectableContactFields = [
  { label: 'First Name', key: 'firstName' },
  { label: 'Last Name', key: 'lastName' },
  { label: 'Job Title', key: 'title' },
  { label: 'Phone', key: 'phone' },
];

const fieldToApiKey: Record<string, string> = {
  'First Name': 'first_name',
  'Last Name': 'last_name',
  'Job Title': 'job_title',
  'Phone': 'phone',
};

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-5 h-5 transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
  </svg>
);

// Helper to flatten and deduplicate arrays
function flatUnique(arr: any): any[] {
  return Array.from(new Set(arr.flat ? arr.flat(Infinity) : arr));
}

// Helper: merge contacts with same name (first+last, case-insensitive)
function mergeContactsByName(contacts: Contact[]): MergedContact[] {
  const map = new Map<string, MergedContact>();
  for (const c of contacts) {
    const key = `${(c.firstName || '').trim().toLowerCase()}|${(c.lastName || '').trim().toLowerCase()}`;
    const sourceKey = Array.isArray(c.source) ? c.source[0] : c.source;
    if (map.has(key)) {
      const existing = map.get(key)!;
      // Merge sources (flatten and dedupe)
      existing.source = flatUnique([
        ...(Array.isArray(existing.source) ? existing.source : [existing.source]),
        ...(Array.isArray(c.source) ? c.source : [c.source]),
      ]);
      // Merge sourceTag (flatten and dedupe)
      existing.sourceTag = flatUnique([
        ...(Array.isArray(existing.sourceTag) ? existing.sourceTag : [existing.sourceTag]),
        c.sourceTag || (typeof c.source === 'string' ? c.source.charAt(0).toUpperCase() + c.source.slice(1) : ''),
      ]);
      // Merge fields: prefer existing, fallback to new if missing
      for (const k of Object.keys(c)) {
        if (existing[k as keyof Contact] == null && c[k as keyof Contact] != null) {
          (existing as any)[k] = c[k as keyof Contact];
        }
      }
      // Store per-source data
      if (sourceKey) existing.sourcesData[sourceKey as DataSource] = c;
    } else {
      // Clone and wrap source/sourceTag as array for multi-source
      map.set(key, {
        ...c,
        source: Array.isArray(c.source) ? flatUnique(c.source) : c.source,
        sourceTag: c.sourceTag || (typeof c.source === 'string' ? c.source.charAt(0).toUpperCase() + c.source.slice(1) : ''),
        sourcesData: sourceKey ? { [sourceKey]: c } : {},
      });
    }
  }
  return Array.from(map.values());
}

const ContactView: React.FC<ContactViewProps> = ({ contacts, crmCompanyName }) => {
  const [openContactIds, setOpenContactIds] = useState<Set<string>>(new Set());
  const [selectedFields, setSelectedFields] = useState<Record<string, Set<string>>>({});

  // Move hooks BEFORE any return!
  const mergedContacts = React.useMemo(() => mergeContactsByName(contacts), [contacts]);
  const grouped = React.useMemo(() => {
    const groups: Record<string, MergedContact[]> = {};
    for (const contact of mergedContacts) {
      const last = (contact.lastName || '').trim();
      const groupKey = last ? last[0].toUpperCase() : '#';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(contact);
    }
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });
    return sortedKeys.map(key => ({
      key,
      contacts: groups[key].sort((a, b) => {
        const la = (a.lastName || '').toLowerCase();
        const lb = (b.lastName || '').toLowerCase();
        if (la === lb) return (a.firstName || '').localeCompare(b.firstName || '');
        return la.localeCompare(lb);
      }),
    }));
  }, [mergedContacts]);

  React.useEffect(() => {
    setOpenContactIds(prev => {
      const valid = new Set(contacts.map(c => c.id));
      return new Set([...prev].filter(id => valid.has(id)));
    });
  }, [contacts]);

  // Helper: highlight if not CRM and value exists
  function getHighlightClass(contact: Contact, headerKey: DataSource, fieldLabel: string, fieldValue: any) {
    if (!fieldValue) return '';
    if (headerKey === 'crm') return '';
    if (contact.source === headerKey) return 'bg-yellow-300 font-semibold text-black';
    return '';
  }

  // Helper: normalize LinkedIn URL
  function getLinkedInUrl(url?: string) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('www.')) return `https://${url}`;
    return `https://www.linkedin.com/in/${url.replace(/^\/+/, '')}`;
  }

  if (!contacts || contacts.length === 0) return null;

  const contactFields = (c: Contact) => [
    { label: 'LinkedIn', key: 'linkedInUrl', value: c.linkedInUrl },
    { label: 'Dear', key: 'dear', value: c.dear },
    { label: 'First Name', key: 'firstName', value: c.firstName },
    { label: 'Last Name', key: 'lastName', value: c.lastName },
    { label: 'Job Title', key: 'title', value: c.title },
    { label: 'Phone', key: 'phone', value: c.phone },
    { label: 'Email', key: 'email', value: c.email },
    { label: 'City', key: 'city', value: c.city },
    { label: 'State', key: 'state', value: c.state },
    { label: 'Zip Code', key: 'zipCode', value: c.zipCode },
    { label: 'Country', key: 'country', value: c.country },
  ];

  const sourceHeaders: { name: string; key: DataSource; color: string }[] = [
    { name: 'CRM', key: 'crm', color: 'bg-green-500' },
    { name: 'Preqin', key: 'preqin', color: 'bg-purple-500' },
    { name: 'Dakota', key: 'dakota', color: 'bg-orange-500' },
    { name: 'PitchBook', key: 'pitchbook', color: 'bg-blue-500' },
    { name: 'ZoomInfo', key: 'zoominfo', color: 'bg-red-500' },
  ];

  const getHeaderStyles = (contact: Contact) => {
    const tag = contact.sourceTag || contact.source;
    switch (tag) {
      case 'CRM':
      case 'crm':
        return { bg: 'bg-gray-50', tagBg: 'bg-green-100', tagText: 'text-green-800' };
      case 'Dakota':
      case 'dakota':
        return { bg: 'bg-orange-50', tagBg: 'bg-white border border-orange-300', tagText: 'text-orange-800' };
      case 'Preqin':
      case 'preqin':
        return { bg: 'bg-purple-50', tagBg: 'bg-white border border-purple-300', tagText: 'text-purple-800' };
      default:
        return { bg: 'bg-white', tagBg: 'bg-gray-200', tagText: 'text-gray-800' };
    }
  };

  // Handle cell select for a contact
  const handleCellSelect = (contactId: string, fieldLabel: string) => {
    setSelectedFields(prev => {
      const prevSet = prev[contactId] || new Set<string>();
      const newSet = new Set(prevSet);
      if (newSet.has(fieldLabel)) {
        newSet.delete(fieldLabel);
      } else {
        newSet.add(fieldLabel);
      }
      return { ...prev, [contactId]: newSet };
    });
  };

  // Handle Create in CRM click
  const handleCreateInCRM = async (contact: MergedContact) => {
    const selected = selectedFields[contact.id] || new Set();
    if (selected.size === 0) {
      alert('Please select at least one field to create in CRM.');
      return;
    }
    // Only allow sources preqin, dakota, zoominfo
    const allowedSources = ['preqin', 'dakota', 'zoominfo'];
    const sourceArr = Array.isArray(contact.source) ? contact.source : [contact.source];
    const sourceIsAllowed = sourceArr.some(src => allowedSources.includes(src as string));

    if (!sourceIsAllowed) {
      alert('Only Preqin, Dakota, or ZoomInfo contacts can be created in CRM.');
      return;
    }
    const payload: any = {
      company_name: crmCompanyName,
      source: sourceArr.find(src => allowedSources.includes(src as string)),
    };
    selectableContactFields.forEach(f => {
      if (selected.has(f.label) && contact[f.key as keyof Contact]) {
        payload[fieldToApiKey[f.label]] = contact[f.key as keyof Contact];
      }
    });
    try {
      await apiService.updateAccountEnhanced(payload);
      alert('Contact sent to CRM!');
      setSelectedFields(prev => ({ ...prev, [contact.id]: new Set() }));
    } catch (e: any) {
      alert('Failed to create in CRM: ' + (e?.message || e));
    }
  };

  return (
    <div className="mt-8 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white rounded-t-lg shadow-lg flex items-center justify-between">
        <h2 className="text-xl font-bold">Contact View</h2>
      </div>
      <div className="rounded-b-lg shadow-inner overflow-hidden">
        {grouped.map(group => (
          <div key={group.key}>
            <div className="space-y-px">
              {group.contacts.map(contact => {
                const isOpen = openContactIds.has(contact.id);
                const headerStyles = getHeaderStyles(contact);
                const selected = selectedFields[contact.id] || new Set();

                function handleToggle(id: string): void {
                  setOpenContactIds(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(id)) {
                      newSet.delete(id);
                    } else {
                      newSet.add(id);
                    }
                    return newSet;
                  });
                }

                return (
                  <div key={contact.id} className={`${headerStyles.bg}`}>
                    <button
                      onClick={() => handleToggle(contact.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-black/5 focus:outline-none transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-gray-900">
                          {contact.firstName || contact.lastName
                            ? `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim()
                            : contact.name || 'Unknown'}
                        </span>
                        <span className="text-sm text-gray-500">{contact.title || 'N/A'}</span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${headerStyles.tagBg} ${headerStyles.tagText}`}
                        >
                          {Array.isArray(contact.sourceTag)
                            ? contact.sourceTag.join(' + ')
                            : contact.sourceTag || (Array.isArray(contact.source) ? contact.source.join(' + ') : contact.source?.toUpperCase())}
                        </span>
                        {contact.category && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {contact.category}
                          </span>
                        )}
                      </div>
                      <ChevronIcon isOpen={isOpen} />
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-200 p-4 bg-white animate-fade-in-fast">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="p-2 border border-gray-300 text-left font-semibold text-gray-700 w-[150px]">
                                  Field
                                </th>
                                {sourceHeaders.map(header => (
                                  <th
                                    key={header.key}
                                    className="p-2 border border-gray-300 text-left font-semibold text-gray-700"
                                  >
                                    <span className="flex items-center">
                                      <span className={`w-2 h-2 rounded-full ${header.color} mr-2`}></span>
                                      {header.name}
                                    </span>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {contactFields(contact).map(field => (
                                <tr key={field.label} className="even:bg-white odd:bg-slate-50">
                                  <td className="p-2 border border-gray-300 font-medium text-gray-800">
                                    {field.label}
                                  </td>
                                  {sourceHeaders.map(header => {
                                    const sourceContact = (contact as MergedContact).sourcesData?.[header.key];
                                    const value = sourceContact ? sourceContact[field.key as keyof Contact] : undefined;

                                    // LinkedIn cell
                                    if (field.label === 'LinkedIn') {
                                      return (
                                        <td key={header.key} className="p-2 border border-gray-300 text-gray-700">
                                          {value ? (
                                            <a
                                              href={getLinkedInUrl(value as string)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-700 underline flex items-center gap-1"
                                            >
                                              <FaLinkedin className="inline" />
                                              LinkedIn
                                            </a>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                      );
                                    }

                                    // All other fields
                                    return (
                                      <td key={header.key} className="p-2 border border-gray-300 text-gray-700">
                                        {value ? value : <span className="text-gray-400">N/A</span>}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                              <tr>
                                <td colSpan={sourceHeaders.length + 1} className="pt-4">
                                  <div className="flex justify-end">
                                    <button
                                      className="bg-green-800 mb-2 mr-2 hover:bg-green-900 text-white font-bold px-4 py-2 rounded shadow"
                                      onClick={() => handleCreateInCRM(contact)}
                                    >
                                      Create in CRM
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactView;
