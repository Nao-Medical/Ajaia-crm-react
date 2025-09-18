// src/components/AccountViewTable.tsx
import React from 'react';
import { type CompanyData, type CrmData } from '../types/crm';

// Define the props this component expects to receive
interface AccountViewTableProps {
    preqinData: CompanyData | null;
    dakotaData: CompanyData | null;
    pitchbookData: CompanyData | null;
    zoomInfoData: CompanyData | null;
    crmData: CrmData | null;
}

// A small helper component to avoid repetitive code for each cell
const DataCell: React.FC<{ value: string | undefined | null }> = ({ value }) => {
    return (
        <td className="border p-2 text-sm">
            {value || <span className="text-gray-400">N/A</span>}
        </td>
    );
};

const AccountViewTable: React.FC<AccountViewTableProps> = ({
    preqinData,
    dakotaData,
    pitchbookData,
    zoomInfoData,
    crmData
}) => {
    // This array defines the rows of our table. It's the "single source of truth" for the table structure.
    const tableRows = [
        { label: 'Company Name', preqin: preqinData?.name, dakota: dakotaData?.name, pitchbook: pitchbookData?.name, zoominfo: zoomInfoData?.name, crm: crmData?.companyName },
        { label: 'Website', preqin: preqinData?.website, dakota: dakotaData?.website, pitchbook: pitchbookData?.website, zoominfo: zoomInfoData?.website, crm: null /* crm doesn't have website? */ },
        { label: 'Industry', preqin: preqinData?.industry, dakota: dakotaData?.industry, pitchbook: pitchbookData?.industry, zoominfo: zoomInfoData?.industry, crm: null },
        // Add more rows here for every field you want to compare
        // e.g., { label: 'Address', preqin: preqinData?.address, ... }
    ];

    return (
        <div className="animate-fade-in">
            <div className="glass-morphism rounded-2xl shadow-soft border border-white/20 overflow-hidden">
                <div className="bg-blue-600 px-4 py-2 text-white">
                    <h2 className="text-lg font-bold">Account View</h2>
                </div>
                <div className="overflow-x-auto bg-white">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 font-semibold text-left">Field</th>
                                <th className="border p-2 font-semibold text-left">Preqin</th>
                                <th className="border p-2 font-semibold text-left">Dakota</th>
                                <th className="border p-2 font-semibold text-left">Pitchbook</th>
                                <th className="border p-2 font-semibold text-left">ZoomInfo</th>
                                <th className="border p-2 font-semibold text-left">CRM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row) => (
                                <tr key={row.label} className="hover:bg-gray-50">
                                    <td className="border p-2 font-medium">{row.label}</td>
                                    <DataCell value={row.preqin} />
                                    <DataCell value={row.dakota} />
                                    <DataCell value={row.pitchbook} />
                                    <DataCell value={row.zoominfo} />
                                    <DataCell value={row.crm} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AccountViewTable;