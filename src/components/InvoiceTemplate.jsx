
import React from 'react';

// This component will be used to generate the print content
// It is usually hidden but we can render it into a portal or just have it in the DOM hidden
// and print it using CSS media queries or a library like react-to-print.
// For simplicity, we'll design it to be rendered in a hidden iframe or just use a simple window.print() approach
// where we temporarily show a print friendly view. 
// A better approach for this context: Open a new window with this HTML string and print it.

export const generateInvoiceHtml = (runData) => {
    const date = new Date().toLocaleString();

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Production Job Sheet - ${runData.id}</title>
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #0066cc; }
          .title { font-size: 20px; font-weight: bold; text-transform: uppercase; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-item label { display: block; font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
          .info-item div { font-size: 16px; font-weight: 500; }
          
          table { w-full; border-collapse: collapse; margin-bottom: 30px; width: 100%; }
          th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #ddd; font-size: 14px; text-transform: uppercase; }
          td { padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px; }
          tfoot td { border-top: 2px solid #000; font-weight: bold; padding-top: 15px; }

          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
          
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">4B Industries</div>
          <div class="title">Production Job Sheet</div>
        </div>

        <div class="info-grid">
           <div class="info-item">
             <label>Run ID</label>
             <div>${runData.id}</div>
           </div>
           <div class="info-item">
             <label>Date Issued</label>
             <div>${date}</div>
           </div>
           <div class="info-item">
             <label>Status</label>
             <div>IN PROGRESS</div>
           </div>
        </div>

        <h3>Raw Materials Required</h3>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Material ID</th>
              <th style="text-align: right;">Quantity Issued</th>
            </tr>
          </thead>
          <tbody>
            ${runData.materials.map(m => `
              <tr>
                <td>${m.name}</td>
                <td>${m.materialId}</td>
                <td style="text-align: right;">${m.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 60px; display: flex; gap: 40px;">
          <div style="flex: 1; border-top: 1px solid #000; padding-top: 8px;">Supervisor Signature</div>
          <div style="flex: 1; border-top: 1px solid #000; padding-top: 8px;">Operator Signature</div>
        </div>

        <div class="footer">
          Generated automatically by 4B Inventory Management System
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;
};
