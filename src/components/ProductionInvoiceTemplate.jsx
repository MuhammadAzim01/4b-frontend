// Template for Production Run Invoice/Report
export const generateProductionInvoiceHtml = (run) => {
    const startDate = new Date(run.start_date).toLocaleString();
    const endDate = run.end_date ? new Date(run.end_date).toLocaleString() : 'N/A';
    const wastage = run?.raw_materials?.filter(m => m.quantity_wasted > 0) || [];
    const returnedItems = run?.raw_materials?.filter(m => m.quantity_returned > 0) || [];

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Production Report - ${run.batch_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            color: #333; 
            background: white;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .logo { 
            font-size: 28px; 
            font-weight: bold; 
            color: #2563eb; 
          }
          .title { 
            font-size: 22px; 
            font-weight: bold; 
            text-transform: uppercase; 
            color: #1e293b;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            background: ${run.status === 'completed' ? '#dcfce7' : '#dbeafe'};
            color: ${run.status === 'completed' ? '#166534' : '#1e40af'};
            margin-left: 10px;
          }
          
          .info-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px; 
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
          }
          .info-item label { 
            display: block; 
            font-size: 11px; 
            color: #64748b; 
            font-weight: 600; 
            text-transform: uppercase; 
            margin-bottom: 6px; 
            letter-spacing: 0.5px;
          }
          .info-item div { 
            font-size: 15px; 
            font-weight: 600; 
            color: #1e293b;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
            margin: 30px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .section-icon {
            width: 20px;
            height: 20px;
            color: #2563eb;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          th { 
            text-align: left; 
            padding: 14px 12px; 
            background: #f1f5f9;
            border-bottom: 2px solid #cbd5e1; 
            font-size: 12px; 
            text-transform: uppercase; 
            font-weight: 600;
            color: #475569;
          }
          td { 
            padding: 12px; 
            border-bottom: 1px solid #f1f5f9; 
            font-size: 14px; 
            color: #1e293b;
          }
          tr:hover {
            background: #f8fafc;
          }
          .text-right { text-align: right; }
          .font-mono { font-family: 'Courier New', monospace; font-weight: 600; }
          
          .cost-summary {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #2563eb;
            margin: 30px 0;
          }
          .cost-summary .total {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          
          .empty-state {
            text-align: center;
            padding: 40px;
            color: #94a3b8;
            font-style: italic;
            background: #f8fafc;
            border-radius: 8px;
            border: 2px dashed #cbd5e1;
          }

          .footer { 
            margin-top: 60px; 
            text-align: center; 
            font-size: 11px; 
            color: #94a3b8; 
            border-top: 1px solid #e2e8f0; 
            padding-top: 20px; 
          }
          
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">4B Industries</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Production Management System</div>
          </div>
          <div style="text-align: right;">
            <div class="title">Production Report <span class="status-badge">${run.status}</span></div>
            <div style="font-size: 14px; color: #64748b; margin-top: 4px; font-family: monospace;">Batch: ${run.batch_number}</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>Started</label>
            <div>${startDate}</div>
          </div>
          <div class="info-item">
            <label>Completed</label>
            <div>${endDate}</div>
          </div>
          ${run.total_cost ? `
          <div class="info-item">
            <label>Total Cost</label>
            <div style="color: #2563eb;">Rs. ${parseFloat(run.total_cost).toFixed(2)}</div>
          </div>
          ` : ''}
        </div>

        <div class="section-title">
          <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          Input: Raw Materials
        </div>
        <table>
          <thead>
            <tr>
              <th>Material Name</th>
              <th class="text-right">Quantity Used</th>
            </tr>
          </thead>
          <tbody>
            ${run.raw_materials?.map(m => `
              <tr>
                <td>${m.raw_material_name}</td>
                <td class="text-right font-mono">${m.quantity_used}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">
          <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          Output: Finished Goods
        </div>
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border: 2px solid #16a34a; margin-bottom: 30px;">
          <table style="box-shadow: none; margin: 0;">
            <tr style="border: none;">
              <td style="border: none; font-size: 14px; color: #166534;">Product</td>
              <td style="border: none; font-size: 18px; font-weight: bold; text-align: right; color: #166534;">${run.product_name || 'N/A'}</td>
            </tr>
            <tr style="border: none;">
              <td style="border: none; font-size: 14px; color: #166534;">Quantity Produced</td>
              <td style="border: none; font-size: 24px; font-weight: bold; text-align: right; color: #16a34a;">${run.product_quantity || 0}</td>
            </tr>
          </table>
        </div>

        ${returnedItems.length > 0 ? `
        <div class="section-title">
          <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
          </svg>
          Returned to Inventory
        </div>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th class="text-right">Quantity Returned</th>
            </tr>
          </thead>
          <tbody>
            ${returnedItems.map(r => `
              <tr>
                <td>${r.raw_material_name}</td>
                <td class="text-right font-mono" style="color: #2563eb;">${r.quantity_returned}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        ${wastage.length > 0 ? `
        <div class="section-title">
          <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Waste / Scrap
        </div>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th class="text-right">Quantity Wasted</th>
            </tr>
          </thead>
          <tbody>
            ${wastage.map(w => `
              <tr>
                <td>${w.raw_material_name}</td>
                <td class="text-right font-mono" style="color: #dc2626;">${w.quantity_wasted}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        ${run.notes ? `
        <div class="section-title">Notes</div>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
          ${run.notes}
        </div>
        ` : ''}

        <div class="footer">
          Generated on ${new Date().toLocaleString()} | 4B Industries Production Management System
        </div>

        <script>
          window.onload = function() { 
            window.print();
            window.onafterprint = function() {
              window.close();
            }
          }
        </script>
      </body>
    </html>
  `;
};
