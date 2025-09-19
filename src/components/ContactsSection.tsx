// src/components/ContactsSection.tsx
import React from 'react';
import { type MergedContact } from '../types/crm';

interface ContactsSectionProps {
    mergedContacts: MergedContact[];
    // We will add handlers for exporting/updating later
    // onExportContact: (contactIndex: number, selectedData: any) => void;
}

const ContactsSection: React.FC<ContactsSectionProps> = ({ mergedContacts }) => {
    if (mergedContacts.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">No contacts found for the current selection.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Contact View</h2>
            {/* This is where you would map over mergedContacts and render a <ContactCard /> for each one */}
            {mergedContacts.map((contact) => (
                <div key={contact.index} className="p-4 bg-white rounded-lg shadow">
                    {/* Placeholder for a detailed ContactCard component */}
                    <p>Contact from: {contact.dataSource}</p>
                    <p>Name: {contact.crmContact?.firstName || contact.preqinContact?.firstName} {contact.crmContact?.lastName || contact.preqinContact?.lastName}</p>
                </div>
            ))}
        </div>
    );
};

export default ContactsSection;