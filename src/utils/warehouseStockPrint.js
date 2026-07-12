export const generateWarehouseStockHtml = ({ products, filterType, asOfDate, startDate, endDate }) => {
    let dateSubtitle = '';
    if (filterType === 'as_of') {
        dateSubtitle = asOfDate ? `Stock as of ${new Date(asOfDate).toLocaleDateString()}` : 'Stock status';
    } else if (filterType === 'custom') {
        dateSubtitle = `From ${startDate || '-'} to ${endDate || '-'}`;
    } else if (filterType === 'week') {
        dateSubtitle = 'Last 7 Days';
    } else if (filterType === 'month') {
        dateSubtitle = 'This Month';
    } else {
        dateSubtitle = 'Total Stock on Hand';
    }

    const rowsHtml = products.length > 0
        ? products.map((product, index) => {
            const packCount = product.pack_size ? (Number(product.stock_quantity || 0) / product.pack_size).toFixed(2) : '0.00';
            return `
                <tr>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center;">${index + 1}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #1e293b;">${product.name}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569; text-align: center; font-family: monospace;">${product.sku || '-'}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace; font-weight: 600;">${packCount}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace; font-weight: 600;">${product.stock_quantity ?? 0}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">${product.unit || 'Units'}</td>
                </tr>
            `;
        }).join('')
        : `<tr><td colspan="6" style="padding: 24px; text-align: center; color: #64748b;">No warehouse products found.</td></tr>`;

    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Finished Goods - Warehouse Stock Status</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px; color: #333; background: white; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 24px; }
                    .logo { font-size: 24px; font-weight: bold; color: #1e3a8a; }
                    .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
                    .title { font-size: 28px; font-weight: bold; color: #1e293b; text-align: right; }
                    table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
                    th { text-align: left; padding: 12px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569; }
                    th.center { text-align: center; }
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
                        <div class="title">WAREHOUSE STOCK REPORT</div>
                        <div style="font-size: 13px; color: #64748b; text-align: right; margin-top: 4px;">${dateSubtitle}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th class="center" style="width: 50px;">S.No</th>
                            <th>Product Name</th>
                            <th class="center">SKU</th>
                            <th class="right">Packs</th>
                            <th class="right">Total Quantity</th>
                            <th>Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>

                <div class="footer">
                    Generated on ${new Date().toLocaleString()} | 4B Industries Warehouse Management System
                </div>
            </body>
        </html>
    `;
};
