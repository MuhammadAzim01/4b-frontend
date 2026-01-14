export const generateInventoryInvoiceHtml = (invoice) => {
  const isSale = invoice.transaction_type === 'sale';
  const createdDate = new Date(invoice.created_at).toLocaleString();

  const itemsHtml = isSale && invoice.items && invoice.items.length > 0 ? `
    <h3 style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 16px;">Items</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <thead>
        <tr>
          <th style="text-align: left; padding: 14px 12px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; font-weight: 600; color: #475569;">Item</th>
          <th style="text-align: right; padding: 14px 12px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; font-weight: 600; color: #475569;">Quantity</th>
          <th style="text-align: right; padding: 14px 12px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; font-weight: 600; color: #475569;">Unit Cost</th>
          <th style="text-align: right; padding: 14px 12px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; font-weight: 600; color: #475569;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map(txn => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b;">${txn.item?.name || '-'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; text-align:right; font-family: 'Courier New', monospace; font-weight: 600;">${txn.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; text-align:right; font-family: 'Courier New', monospace; font-weight: 600;">${(txn.unit_cost !== undefined && txn.unit_cost !== null) ? 'Rs. ' + parseFloat(txn.unit_cost).toFixed(2) : '-'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; text-align:right; font-family: 'Courier New', monospace; font-weight: 600;">Rs. ${(Number(txn.quantity || 0) * Number(txn.unit_cost || 0)).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Inventory ${isSale ? 'Invoice' : 'Receipt'} - ${invoice.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: white; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
          .company-info { font-size: 12px; color: #64748b; margin-top: 4px; }
          .invoice-title { font-size: 32px; font-weight: bold; color: #1e293b; text-align: right; }
          .invoice-number { font-size: 14px; color: #64748b; font-family: monospace; margin-top: 4px; text-align: right; }
          .parties-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .party-box { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .party-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
          .party-name { font-size: 18px; font-weight: bold; color: #1e293b; margin-bottom: 4px; }
          .invoice-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; background: ${isSale ? '#eff6ff' : '#dcfce7'}; padding: 20px; border-radius: 8px; border: 2px solid ${isSale ? '#2563eb' : '#16a34a'}; }
          .meta-item { text-align: center; }
          .meta-label { font-size: 11px; color: ${isSale ? '#1e40af' : '#166534'}; font-weight: 600; text-transform: uppercase; margin-bottom: 6px; }
          .meta-value { font-size: 15px; font-weight: 600; color: #1e293b; }
          .transaction-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; background: ${isSale ? '#dbeafe' : '#dcfce7'}; color: ${isSale ? '#1e40af' : '#166534'}; }
          .payment-summary { background: #eff6ff; padding: 25px; border-radius: 8px; border: 2px solid #2563eb; margin: 30px 0; }
          .payment-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .payment-row.total { border-top: 2px solid #2563eb; padding-top: 16px; margin-top: 8px; }
          .payment-label { color: #475569; font-weight: 500; }
          .payment-value { font-family: 'Courier New', monospace; font-weight: 600; color: #1e293b; }
          .payment-value.highlight { font-size: 20px; color: #2563eb; }
          .payment-value.paid { color: #16a34a; }
          .payment-value.due { color: #dc2626; }
          .notes-section { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 30px 0; }
          .notes-title { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
          .notes-content { font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap; }
          .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print { body { padding: 20px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">4B Industries</div>
            <div class="company-info">Inventory Management System</div>
          </div>
          <div>
            <div class="invoice-title">${isSale ? 'INVOICE' : 'RECEIPT'}</div>
            <div class="invoice-number">#${invoice.id}</div>
          </div>
        </div>

        <div class="parties-grid">
          <div class="party-box">
            <div class="party-label">From</div>
            <div class="party-name">4B Industries</div>
          </div>
          <div class="party-box">
            <div class="party-label">${isSale ? 'Bill To' : 'Payment From'}</div>
            <div class="party-name">${invoice.supplier_name || invoice.supplier?.name || '-'}</div>
          </div>
        </div>

        <div class="invoice-meta">
          <div class="meta-item">
            <div class="meta-label">Date</div>
            <div class="meta-value">${createdDate}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Type</div>
            <div class="meta-value">
              <span class="transaction-badge">${isSale ? 'Sale' : 'Payment'}${invoice.payment_method ? ' - ' + invoice.payment_method : ''}</span>
            </div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Created By</div>
            <div class="meta-value">${invoice.created_by_name || '-'}</div>
          </div>
        </div>

        ${!isSale && invoice.related_invoice_number ? `
        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border: 2px solid #f59e0b; margin-bottom: 30px;">
          <div style="font-size: 11px; color: #92400e; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Payment for Invoice</div>
          <div style="font-family: monospace; font-weight: bold; color: #78350f; font-size: 16px;">${invoice.related_invoice_number}</div>
        </div>
        ` : ''}

        ${itemsHtml}

        <div class="payment-summary">
          <div class="payment-row">
            <span class="payment-label">Gross Amount</span>
            <span class="payment-value highlight">Rs. ${parseFloat(invoice.total_amount || 0).toFixed(2)}</span>
          </div>
          <div class="payment-row" style="margin-top: 12px;">
            <span class="payment-label">Amount Paid</span>
            <span class="payment-value paid">Rs. ${parseFloat(invoice.amount_paid || 0).toFixed(2)}</span>
          </div>
          <div class="payment-row total">
            <span class="payment-label" style="font-weight: 600; font-size: 16px;">Balance Due</span>
            <span class="payment-value ${parseFloat(invoice.balance_due || 0) > 0 ? 'due' : 'paid'}" style="font-size: 22px;">Rs. ${parseFloat(invoice.balance_due || 0).toFixed(2)}</span>
          </div>
        </div>

        ${invoice.notes ? `
        <div class="notes-section">
          <div class="notes-title">Notes</div>
          <div class="notes-content">${invoice.notes}</div>
        </div>
        ` : ''}

        <div class="footer">
          Generated on ${new Date().toLocaleString()} | 4B Industries Inventory Management System
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
