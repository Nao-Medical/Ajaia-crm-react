// src/components/AccountViewTable.tsx
import React, { useState, useMemo } from 'react';
import './AccountViewTable.css';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnSizingState,
} from '@tanstack/react-table';
import { type CompanyData, type CrmData } from '../types/crm';
import { type DataSource } from '../services/apiService'; // Make sure DataSource is exported from apiService
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

// Props for the main table component
interface AccountViewTableProps {
    preqinData: CompanyData | null;
    dakotaData: CompanyData | null;
    pitchbookData: CompanyData | null;
    zoomInfoData: CompanyData | null;
    crmData: CrmData | null;
    onSearch: (source: DataSource, query: string) => void;
}

// A helper for rendering cells
const DataCell: React.FC<{ value: string | undefined | null }> = ({ value }) => (
    <div className="p-2">{value || <span className="text-gray-400">N/A</span>}</div>
);

const columnHelper = createColumnHelper<RowData>();

const AccountViewTable: React.FC<AccountViewTableProps> = ({
    onSearch,
    preqinData,
    dakotaData,
    pitchbookData,
    zoomInfoData,
    crmData
}) => {
    // State for column resizing
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

    // Memoize the data array to prevent re-computation on every render
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

    // Memoize column definitions
    const columns = useMemo(() => [
        columnHelper.accessor('field', {
            header: () => <span>Field</span>,
            cell: info => info.getValue(),
            size: 150,
            enableResizing: false, // Optionally disable resizing for the field column
        }),
        columnHelper.accessor('crm', {
            header: () => (
                <>
                    <div className="font-semibold text-sm mb-1 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>CRM Data</div>
                    <ColumnSearch
                        source="crm"
                        initialValue={crmData?.companyName || ''}
                        onSubmit={onSearch}
                        color="green"
                    />
                </>
            ),
            cell: info => <DataCell value={info.getValue()} />,
            size: 200,
        }),
        columnHelper.accessor('preqin', {
            header: () => (
                <>
                    <div className="font-semibold text-sm mb-1 flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>Preqin Data</div>
                    <ColumnSearch
                        source="preqin"
                        initialValue={preqinData?.name || ''}
                        onSubmit={onSearch}
                        color="purple"
                    />
                </>
            ),
            cell: info => <DataCell value={info.getValue()} />,
            size: 200,
        }),
        columnHelper.accessor('dakota', {
            header: () => (
                <>
                    <div className="font-semibold text-sm mb-1 flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>Dakota Data</div>
                    <ColumnSearch
                        source="dakota"
                        initialValue={dakotaData?.name || ''}
                        onSubmit={onSearch}
                        color="orange"
                    />
                </>
            ),
            cell: info => <DataCell value={info.getValue()} />,
            size: 200,
        }),
        columnHelper.accessor('pitchbook', {
            header: () => (
                <>
                    <div className="font-semibold text-sm mb-1 flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>PitchBook Data</div>
                    <ColumnSearch
                        source="pitchbook"
                        initialValue={pitchbookData?.name || ''}
                        onSubmit={onSearch}
                        color="blue"
                    />
                </>
            ),
            cell: info => <DataCell value={info.getValue()} />,
            size: 200,
        }),
        columnHelper.accessor('zoominfo', {
            header: () => (
                <>
                    <div className="font-semibold text-sm mb-1 flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>ZoomInfo Data</div>
                    <ColumnSearch
                        source="zoominfo"
                        initialValue={zoomInfoData?.name || ''}
                        onSubmit={onSearch}
                        color="red"
                    />
                </>
            ),
            cell: info => <DataCell value={info.getValue()} />,
            size: 200,
        }),
    ], [onSearch, preqinData, dakotaData, pitchbookData, zoomInfoData, crmData]); // Dependencies now include all data props and onSearch

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: 'onChange',
        enableColumnResizing: true,
        state: {
            columnSizing,
        },
        onColumnSizingChange: setColumnSizing,
    });

    return (
        <div className="animate-fade-in">
            <div className="glass-morphism rounded-2xl shadow-soft border border-white/20 overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 text-white">
                    <h2 className="text-xl font-bold">Account View</h2>
                </div>
                <div className="overflow-x-auto">
                    {/* The `tanstack-table` class comes from our CSS file */}
                    <table className="tanstack-table">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className="relative border-b-2 border-gray-200 bg-gray-50 align-top"
                                            style={{ width: header.getSize() }}
                                        >
                                            <div className="p-2 text-left text-sm font-semibold text-gray-600">
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
                                            className="border-b border-gray-200 text-sm text-gray-700 align-top"
                                            style={{ width: cell.column.getSize() }}
                                        >
                                            {/* Note: In your original code, the first column was styled differently. */}
                                            {/* We can add conditional styling here if needed. */}
                                            {cell.column.id === 'field' ? (
                                                <div className="p-2 font-medium text-gray-800 bg-gray-50">
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
                    <div>
                        {/* TODO: Create a proper legend component */}
                        <span className="text-sm text-gray-600">Legend: ...</span>
                    </div>
                    <button className="px-4 py-2 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors shadow">
                        Select Fields to Update
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountViewTable;