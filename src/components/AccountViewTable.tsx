import React, { useState, useMemo, useCallback } from 'react';
import './AccountViewTable.css';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnSizingState,
} from '@tanstack/react-table';
import { apiService, type DataSource } from '../services/apiService';
import { type CompanyData, type Contact, type CrmData } from '../types/crm';
import ColumnSearch from './ColumnSearch';

// Define the shape of a single row's data
type RowData = {
    field: string;
    crm: string | null;
    preqin: string | null;
    dakota: string | null;
    pitchbook: string | null;
    zoominfo: string | null;
};

// A helper for rendering cells
const DataCell: React.FC<{ value: string | undefined | null }> = ({ value }) => (
    <div className="p-2">{value || <span className="text-gray-400">N/A</span>}</div>
);

const columnHelper = createColumnHelper<RowData>();

interface AccountViewTableProps {
    crmData: CrmData | null;
    preqinData: CompanyData | null;
    dakotaData: CompanyData | null;
    pitchbookData: CompanyData | null;
    zoomInfoData: CompanyData | null;
    setCrmData: React.Dispatch<React.SetStateAction<CrmData | null>>;
    setPreqinData: React.Dispatch<React.SetStateAction<CompanyData | null>>;
    setDakotaData: React.Dispatch<React.SetStateAction<CompanyData | null>>;
    setPitchbookData: React.Dispatch<React.SetStateAction<CompanyData | null>>;
    setZoomInfoData: React.Dispatch<React.SetStateAction<CompanyData | null>>;
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

const AccountViewTable: React.FC<AccountViewTableProps> = ({
    crmData, preqinData, dakotaData, pitchbookData, zoomInfoData,
    setCrmData, setPreqinData, setDakotaData, setPitchbookData, setZoomInfoData,
    setContacts
}) => {
    // merge contacts from the latest enhanced call for that source
    const mergeContactsForSource = useCallback((source: DataSource, incoming: any[] | undefined) => {
        const norm: Contact[] = (incoming ?? []).map((c, idx) => {
            // Build a stable, source-scoped id
            const safeId = c.id || `${source}-${c.email || c.phone || idx}`;
            // Prefer explicit fields, fall back sensibly
            const firstName = c.firstName ?? (c.name ? String(c.name).split(' ')[0] : undefined);
            const lastName =
                c.lastName ??
                (c.name && String(c.name).trim().includes(' ')
                    ? String(c.name).trim().split(' ').slice(1).join(' ')
                    : undefined);

            return {
                id: `${source}:${safeId}`,
                source,
                sourceTag: (source.charAt(0).toUpperCase() + source.slice(1)),
                name: c.name ?? [firstName, lastName].filter(Boolean).join(' '),
                firstName,
                lastName,
                title: c.title,
                email: c.email,
                phone: c.phone,
                city: c.city ?? c.location,
                state: c.state ?? undefined,
                zipCode: c.zipCode ?? undefined,
                country: c.country ?? undefined,
                linkedInUrl: c.linkedInUrl ?? c.linkedIn ?? c.linkedin ?? undefined,
                dear: c.dear ?? undefined,
                // keep any other fields without breaking typing
                // ...c,
            } as Contact;
        });

        setContacts(prev => {
            const others = prev.filter(p => p.source !== source);
            return [...others, ...norm];
        });
    }, [setContacts]);

    // Stable search handler
    const handleColumnSearch = useCallback(async (source: DataSource, query: string) => {
        try {
            const result = await apiService.searchEnhanced(source, query);
            // Update company data
            switch (source) {
                case 'crm': setCrmData(result.company as CrmData); break;
                case 'preqin': setPreqinData(result.company); break;
                case 'dakota': setDakotaData(result.company); break;
                case 'pitchbook': setPitchbookData(result.company); break;
                case 'zoominfo': setZoomInfoData(result.company); break;
            }
            // Merge contacts from this source only
            mergeContactsForSource(source, result.contacts);
        } catch (error) {
            console.error(`Search failed for ${source}:`, error);
        }
    }, [mergeContactsForSource, setCrmData, setPreqinData, setDakotaData, setPitchbookData, setZoomInfoData]);

    // State for column resizing
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

    // Global search states
    const [globalSearchEnabled, setGlobalSearchEnabled] = useState(false);
    const [globalQuery, setGlobalQuery] = useState('');
    const [globalSearchTrigger, setGlobalSearchTrigger] = useState(0);
    const [openDropdowns, setOpenDropdowns] = useState<{ [key in DataSource]?: boolean }>({});

    // Table data
    const data = useMemo<RowData[]>(() => [
        { field: 'Company Name', crm: crmData?.name ?? null, preqin: preqinData?.name ?? null, dakota: dakotaData?.name ?? null, pitchbook: pitchbookData?.name ?? null, zoominfo: zoomInfoData?.name ?? null },
        { field: 'Type', crm: crmData?.type ?? null, preqin: preqinData?.type ?? null, dakota: dakotaData?.type ?? null, pitchbook: pitchbookData?.type ?? null, zoominfo: zoomInfoData?.type ?? null },
        { field: 'Subtype', crm: crmData?.subtype ?? null, preqin: preqinData?.type ?? null, dakota: dakotaData?.subtype ?? null, pitchbook: pitchbookData?.subtype ?? null, zoominfo: zoomInfoData?.subtype ?? null },
        { field: 'AUM ($B)', crm: crmData?.aum ?? null, preqin: preqinData?.aum ?? null, dakota: dakotaData?.aum ?? null, pitchbook: pitchbookData?.aum ?? null, zoominfo: zoomInfoData?.aum ?? null },
        { field: 'Street 1', crm: crmData?.address ?? null, preqin: preqinData?.address ?? null, dakota: dakotaData?.street1 ?? null, pitchbook: pitchbookData?.street1 ?? null, zoominfo: zoomInfoData?.street1 ?? null },
        { field: 'Street 2', crm: crmData?.address2 ?? null, preqin: preqinData?.street2 ?? null, dakota: dakotaData?.address ?? null, pitchbook: pitchbookData?.address ?? null, zoominfo: zoomInfoData?.address ?? null },
        { field: 'City', crm: crmData?.city ?? null, preqin: preqinData?.city_full ?? null, dakota: dakotaData?.city ?? null, pitchbook: pitchbookData?.city ?? null, zoominfo: zoomInfoData?.city ?? null },
        { field: 'State', crm: crmData?.state ?? null, preqin: preqinData?.state ?? null, dakota: dakotaData?.state ?? null, pitchbook: pitchbookData?.state ?? null, zoominfo: zoomInfoData?.state ?? null },
        { field: 'Postal Code', crm: crmData?.zipCode ?? null, preqin: preqinData?.zipCode ?? null, dakota: dakotaData?.zipCode ?? null, pitchbook: pitchbookData?.zipCode ?? null, zoominfo: zoomInfoData?.zipCode ?? null },
        { field: 'Country', crm: crmData?.country ?? null, preqin: preqinData?.country ?? null, dakota: dakotaData?.country ?? null, pitchbook: pitchbookData?.country ?? null, zoominfo: zoomInfoData?.country ?? null },
        { field: 'Main Phone', crm: crmData?.phone ?? null, preqin: preqinData?.phone ?? null, dakota: dakotaData?.phone ?? null, pitchbook: pitchbookData?.phone ?? null, zoominfo: zoomInfoData?.phone ?? null },
        { field: 'Website', crm: crmData?.website ?? null, preqin: preqinData?.website ?? null, dakota: dakotaData?.website ?? null, pitchbook: pitchbookData?.website ?? null, zoominfo: zoomInfoData?.website ?? null },
    ], [crmData, preqinData, dakotaData, pitchbookData, zoomInfoData]);

    // Handler for global search button
    const handleGlobalSearch = () => {
        setGlobalSearchTrigger(t => t + 1);
        setOpenDropdowns({
            crm: true,
            preqin: true,
            dakota: true,
            pitchbook: true,
            zoominfo: true,
        });
    };

    // Column defs (static identity)
    const columns = useMemo(() => [
        columnHelper.accessor('field', {
            header: () => <span>Field</span>,
            cell: info => info.getValue(),
            size: 150,
            enableResizing: false,
        }),
        columnHelper.accessor('crm', {
            header: () => (
                <>
                    <div className="font-extrabold text-xs mb-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>CRM Data
                    </div>
                    <ColumnSearch
                        source="crm"
                        initialValue=""
                        onSubmit={handleColumnSearch}
                        color="green"
                        forceOpen={!!openDropdowns['crm']}
                        forceQuery={globalQuery}
                        trigger={globalSearchTrigger}
                    />
                </>
            ),
            cell: info => <DataCell value={info.getValue()} />,
            size: 200,
        }),
        columnHelper.accessor('preqin', {
            header: () => (
                <>
                    <div className="font-extrabold text-xs mb-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>Preqin Data
                    </div>
                    <ColumnSearch
                        source="preqin"
                        initialValue=""
                        onSubmit={handleColumnSearch}
                        color="purple"
                        forceOpen={!!openDropdowns['preqin']}
                        forceQuery={globalQuery}
                        trigger={globalSearchTrigger}
                    />
                </>
            ),
            cell: info => <DataCell value={info.getValue()} />,
            size: 200,
        }),
        columnHelper.accessor('dakota', {
            header: () => (
                <>
                    <div className="font-extrabold text-xs mb-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>Dakota Data
                    </div>
                    <ColumnSearch
                        source="dakota"
                        initialValue=""
                        onSubmit={handleColumnSearch}
                        color="orange"
                        forceOpen={!!openDropdowns['dakota']}
                        forceQuery={globalQuery}
                        trigger={globalSearchTrigger}
                    />
                </>
            ),
            cell: info => <DataCell value={info.getValue()} />,
            size: 200,
        }),
        columnHelper.accessor('pitchbook', {
            header: () => (
                <>
                    <div className="font-extrabold text-xs mb-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>PitchBook Data
                    </div>
                    <ColumnSearch
                        source="pitchbook"
                        initialValue=""
                        onSubmit={handleColumnSearch}
                        color="blue"
                        forceOpen={!!openDropdowns['pitchbook']}
                        forceQuery={globalQuery}
                        trigger={globalSearchTrigger}
                    />
                </>
            ),
            cell: info => <DataCell value={info.getValue()} />,
            size: 200,
        }),
        columnHelper.accessor('zoominfo', {
            header: () => (
                <>
                    <div className="font-extrabold text-xs mb-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>ZoomInfo Data
                    </div>
                    <ColumnSearch
                        source="zoominfo"
                        initialValue=""
                        onSubmit={handleColumnSearch}
                        color="red"
                        forceOpen={!!openDropdowns['zoominfo']}
                        forceQuery={globalQuery}
                        trigger={globalSearchTrigger}
                    />
                </>
            ),
            cell: info => <DataCell value={info.getValue()} />,
            size: 200,
        }),
    ], [handleColumnSearch, globalQuery, openDropdowns, globalSearchTrigger]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: 'onChange',
        enableColumnResizing: true,
        state: { columnSizing },
        onColumnSizingChange: setColumnSizing,
    });

    return (
        <div className="animate-fade-in">
            <div className="glass-morphism rounded-2xl shadow-soft border border-white/20 overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between">
                    <h2 className="text-xl font-bold">Account View</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-xs">Global Search</span>
                        <button
                            className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 focus:outline-none ${globalSearchEnabled ? 'bg-green-400' : 'bg-gray-400'}`}
                            onClick={() => setGlobalSearchEnabled(v => !v)}
                            type="button"
                        >
                            <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${globalSearchEnabled ? 'translate-x-5' : ''}`}
                            />
                        </button>
                    </div>
                </div>
                {globalSearchEnabled && (
                    <div className="px-6 py-3 bg-gray-50 border-b flex items-center gap-2">
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search all sources..."
                            value={globalQuery}
                            onChange={e => setGlobalQuery(e.target.value)}
                        />
                        <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition"
                            onClick={handleGlobalSearch}
                        >
                            Search
                        </button>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="tanstack-table">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className="relative border border-black bg-gray-50 align-top"
                                            style={{ width: header.getSize() }}
                                        >
                                            <div className="p-2 text-left text-xs font-semibold text-gray-600">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </div>
                                            {header.column.getCanResize() && (
                                                <div
                                                    onMouseDown={header.getResizeHandler()}
                                                    onTouchStart={header.getResizeHandler()}
                                                    className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`}
                                                />
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            className="border border-black text-xs text-gray-700 align-top"
                                            style={{ width: cell.column.getSize() }}
                                        >
                                            {cell.column.id === 'field' ? (
                                                <div className="p-2 font-medium text-gray-800 bg-white">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </div>
                                            ) : (
                                                flexRender(cell.column.columnDef.cell, cell.getContext())
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                    <span className="text-xs text-gray-600">Legend: ...</span>
                    <div className='flex gap-3'>
                        <button className="px-4 py-2 bg-slate-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors shadow">
                            Select Fields to Update
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-400 transition-colors shadow"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountViewTable;
