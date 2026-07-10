const getPeriodLabel = (filterType, startDate, endDate) => {
    if (filterType === 'week') return 'Last 7 Days';
    if (filterType === 'month') return 'This Month';
    if (filterType === 'custom' && startDate && endDate) {
        return `${new Date(startDate).toLocaleDateString()} – ${new Date(endDate).toLocaleDateString()}`;
    }
    if (filterType === 'custom') return 'Custom Range';
    return filterType;
};

const getTypeLabel = (txType) => {
    if (txType === 'in') return 'Stock In (Production & Manual)';
    if (txType === 'out') return 'Sales Only (OUT)';
    return 'All Types';
};

export const generateWarehouseLedgerHtml = ({ product, transactions, filterType, startDate, endDate, txType }) => {
    const periodLabel = getPeriodLabel(filterType, startDate, endDate);
    const typeLabel = getTypeLabel(txType);

    const totalIn = transactions
        .filter((txn) => txn.transaction_type === 'in')
        .reduce((sum, txn) => sum + Math.abs(Number(txn.quantity) || 0), 0);

    const totalOut = transactions
        .filter((txn) => txn.transaction_type === 'out')
        .reduce((sum, txn) => sum + Math.abs(Number(txn.quantity) || 0), 0);

    const rowsHtml = transactions.length > 0
        ? transactions.map((txn) => `
            <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
                    <div style="font-weight: 600; color: #1e293b;">${new Date(txn.transaction_date).toLocaleDateString()}</div>
                    <div style="font-size: 11px; color: #64748b;">${new Date(txn.transaction_date).toLocaleTimeString()}</div>
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 13px; font-weight: 600;">${txn.id}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${txn.reference_info || '-'}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                    <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: ${txn.transaction_type === 'in' ? '#dcfce7' : '#fee2e2'}; color: ${txn.transaction_type === 'in' ? '#166534' : '#991b1b'};">
                        ${txn.transaction_type}
                    </span>
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: 600; color: #16a34a;">
                    ${txn.transaction_type === 'in' ? `+${Math.abs(txn.quantity).toLocaleString()}` : '-'}
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: 600; color: #dc2626;">
                    ${txn.transaction_type === 'out' ? `-${Math.abs(txn.quantity).toLocaleString()}` : '-'}
                </td>
            </tr>
        `).join('')
        : `<tr><td colspan="6" style="padding: 24px; text-align: center; color: #64748b;">No transactions found for this selection.</td></tr>`;

    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Warehouse Ledger - ${product.name}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px; color: #333; background: white; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
                    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
                    .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
                    .title { font-size: 28px; font-weight: bold; color: #1e293b; text-align: right; }
                    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
                    .meta-box { background: #f8fafc; padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
                    .meta-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
                    .meta-value { font-size: 14px; font-weight: 600; color: #1e293b; }
                    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
                    .summary-card { background: #eff6ff; border: 2px solid #2563eb; border-radius: 8px; padding: 16px; text-align: center; }
                    .summary-label { font-size: 10px; color: #1e40af; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
                    .summary-value { font-size: 20px; font-weight: 700; font-family: monospace; color: #1e293b; }
                    table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
                    th { text-align: left; padding: 12px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569; }
                    th.right { text-align: right; }
                    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
                    @media print { body { padding: 16px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">4B Industries</div>
                        <div class="subtitle">Finished Goods Warehouse</div>
                    </div>
                    <div>
                        <div class="title">PRODUCT LEDGER</div>
                    </div>
                </div>

                <div class="meta-grid">
                    <div class="meta-box">
                        <div class="meta-label">Product</div>
                        <div class="meta-value">${product.name}</div>
                    </div>
                    <div class="meta-box">
                        <div class="meta-label">SKU</div>
                        <div class="meta-value">${product.sku || 'N/A'}</div>
                    </div>
                    <div class="meta-box">
                        <div class="meta-label">Period</div>
                        <div class="meta-value">${periodLabel}</div>
                    </div>
                    <div class="meta-box">
                        <div class="meta-label">Transaction Type</div>
                        <div class="meta-value">${typeLabel}</div>
                    </div>
                </div>

                <div class="summary">
                    <div class="summary-card">
                        <div class="summary-label">Total In</div>
                        <div class="summary-value" style="color: #16a34a;">+${totalIn.toLocaleString()}</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Total Out</div>
                        <div class="summary-value" style="color: #dc2626;">-${totalOut.toLocaleString()}</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Transactions</div>
                        <div class="summary-value">${transactions.length}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Reference ID</th>
                            <th>Info</th>
                            <th style="text-align: center;">Type</th>
                            <th class="right">In</th>
                            <th class="right">Out</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>

                <div class="footer">
                    Generated on ${new Date().toLocaleString()} | 4B Industries Warehouse Management System
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() { window.close(); }
                    }
                </script>
            </body>
        </html>
    `;
};
