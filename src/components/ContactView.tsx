// src/components/ContactView.tsx
import React, { useState } from 'react';
import { type DataSource } from '../services/apiService';
import { type Contact as OriginalContact } from '../types/crm';

type Contact = OriginalContact & {
  firstName?: string;
  lastName?: string;
  title?: string;
};

interface ContactViewProps {
  contacts: Contact[];
}

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

const ContactView: React.FC<ContactViewProps> = ({ contacts }) => {
  const [openContactIds, setOpenContactIds] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    // Keep only ids that still exist
    setOpenContactIds(prev => {
      const valid = new Set(contacts.map(c => c.id));
      return new Set([...prev].filter(id => valid.has(id)));
    });
  }, [contacts]);

  const handleToggle = (id: string) => {
    setOpenContactIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  if (!contacts || contacts.length === 0) return null;

  const contactFields = (c: Contact) => [
    { label: 'LinkedIn', value: c.linkedInUrl },
    { label: 'Dear', value: c.dear },
    { label: 'First Name', value: c.firstName },
    { label: 'Last Name', value: c.lastName },
    { label: 'Job Title', value: c.title },
    { label: 'Phone', value: c.phone },
    { label: 'Email', value: c.email },
    { label: 'City', value: c.city },
    { label: 'State', value: c.state },
    { label: 'Zip Code', value: c.zipCode },
    { label: 'Country', value: c.country },
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

  // Group/sort by last name
  const sorted = [...contacts].sort((a, b) => {
    const la = (a.lastName || '').toLowerCase();
    const lb = (b.lastName || '').toLowerCase();
    if (la === lb) return (a.firstName || '').localeCompare(b.firstName || '');
    return la.localeCompare(lb);
  });

  return (
    <div className="mt-8 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white rounded-t-lg shadow-lg">
        <h2 className="text-xl font-bold">Contact View</h2>
      </div>
      <div className="space-y-px bg-slate-200 rounded-b-lg shadow-inner overflow-hidden">
        {sorted.map(contact => {
          const isOpen = openContactIds.has(contact.id);
          const headerStyles = getHeaderStyles(contact);

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
                    {contact.sourceTag || contact.source.toUpperCase()}
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
                            <td className="p-2 border border-gray-300 font-medium text-gray-800">{field.label}</td>
                            {sourceHeaders.map(header => {
                              const hasData = contact.source === header.key && field.value;
                              return (
                                <td
                                  key={header.key}
                                  className={`p-2 border border-gray-300 text-gray-700 ${
                                    hasData ? 'bg-yellow-100 font-semibold' : ''
                                  }`}
                                >
                                  {hasData ? field.value : <span className="text-gray-400">N/A</span>}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
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
  );
};

export default ContactView;
