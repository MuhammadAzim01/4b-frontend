const CATEGORY_LABELS = {
    raw_materials: 'Raw Materials',
    plant_assets: 'Plant Assets',
    returnable_assets: 'Returnable Assets',
};

const getStatusStyle = (status) => {
    if (status === 'In Stock') return { bg: '#dcfce7', color: '#166534' };
    if (status === 'Low Stock') return { bg: '#fef9c3', color: '#854d0e' };
    if (status === 'Out of Stock') return { bg: '#fee2e2', color: '#991b1b' };
    return { bg: '#f1f5f9', color: '#475569' };
};

export const generateInventoryStatusHtml = ({ items, category, isAdmin }) => {
    const categoryLabel = CATEGORY_LABELS[category] || category;

    const totalQuantity = items.reduce((sum, item) => sum + Number(item.available_quantity || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + Number(item.available_price || 0), 0);
    const inStockCount = items.filter((item) => item.stock_status === 'In Stock').length;
    const outOfStockCount = items.filter((item) => item.stock_status === 'Out of Stock').length;

    const rowsHtml = items.length > 0
        ? items.map((item, index) => {
            const style = getStatusStyle(item.stock_status);
            return `
                <tr>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center;">${index + 1}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #1e293b;">${item.name}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace; font-weight: 600;">${item.available_quantity ?? 0}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #475569;">${item.unit || '-'}</td>
                    ${isAdmin ? `<td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-family: monospace; font-weight: 600;">Rs. ${Number(item.available_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>` : ''}
                    <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                        <span style="display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: ${style.bg}; color: ${style.color};">
                            ${item.stock_status || 'No Data'}
                        </span>
                    </td>
                </tr>
            `;
        }).join('')
        : `<tr><td colspan="${isAdmin ? 6 : 5}" style="padding: 24px; text-align: center; color: #64748b;">No inventory items found.</td></tr>`;

    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Inventory Status - ${categoryLabel}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px; color: #333; background: white; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
                    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
                    .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
                    .title { font-size: 28px; font-weight: bold; color: #1e293b; text-align: right; }
                    .summary { display: grid; grid-template-columns: repeat(${isAdmin ? 4 : 3}, 1fr); gap: 16px; margin-bottom: 24px; }
                    .summary-card { background: #eff6ff; border: 2px solid #2563eb; border-radius: 8px; padding: 16px; text-align: center; }
                    .summary-label { font-size: 10px; color: #1e40af; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
                    .summary-value { font-size: 20px; font-weight: 700; font-family: monospace; color: #1e293b; }
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
                        <div class="subtitle">Inventory Management System</div>
                    </div>
                    <div>
                        <div class="title">INVENTORY STATUS</div>
                        <div style="font-size: 13px; color: #64748b; text-align: right; margin-top: 4px;">${categoryLabel}</div>
                    </div>
                </div>

                <div class="summary">
                    <div class="summary-card">
                        <div class="summary-label">Total Items</div>
                        <div class="summary-value">${items.length}</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">In Stock</div>
                        <div class="summary-value" style="color: #16a34a;">${inStockCount}</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Out of Stock</div>
                        <div class="summary-value" style="color: #dc2626;">${outOfStockCount}</div>
                    </div>
                    ${isAdmin ? `
                    <div class="summary-card">
                        <div class="summary-label">Total Value</div>
                        <div class="summary-value">Rs. ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    ` : ''}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th class="center" style="width: 40px;">#</th>
                            <th>Item Name</th>
                            <th class="right">Quantity</th>
                            <th>Unit</th>
                            ${isAdmin ? '<th class="right">Total Value</th>' : ''}
                            <th class="center">Status</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>

                <div class="footer">
                    Generated on ${new Date().toLocaleString()} | Total quantity across all items: ${totalQuantity.toLocaleString()}
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
