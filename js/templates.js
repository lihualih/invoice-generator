/**
 * Invoice Templates - Three Professional Designs
 * Each template renders the invoice preview HTML
 */

const InvoiceTemplates = {
  /**
   * Template 1: Classic
   * Traditional business style with blue header accents
   */
  classic: {
    name: 'Classic',
    description: 'Traditional professional style',
    render: function(data) {
      const { company, client, invoice, items, totals, currency, notes, logoUrl } = data;

      const formatMoney = (amount) => {
        return formatCurrency(amount, currency);
      };

      const itemsHtml = items.map(item => `
        <tr>
          <td>${escapeHtml(item.description) || 'Item description'}</td>
          <td>${item.quantity || 0}</td>
          <td>${formatMoney(item.rate || 0)}</td>
          <td>${item.tax || 0}%</td>
          <td>${formatMoney(item.total || 0)}</td>
        </tr>
      `).join('');

      return `
        <div class="invoice-template classic">
          <div class="invoice-header">
            <div class="company-info">
              ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo" style="max-height: 60px; margin-bottom: 12px;">` : ''}
              <h2>${escapeHtml(company.name) || 'Your Company'}</h2>
              <div class="company-details">
                ${escapeHtml(company.address) || '123 Business Street'}<br>
                ${escapeHtml(company.city) || 'City, State ZIP'}<br>
                ${company.email ? escapeHtml(company.email) : 'email@company.com'}<br>
                ${company.phone ? escapeHtml(company.phone) : ''}
              </div>
            </div>
            <div class="invoice-title">
              <h1>INVOICE</h1>
              <div class="invoice-meta">
                <div><strong>Invoice #:</strong> ${escapeHtml(invoice.number) || 'INV-001'}</div>
                <div><strong>Date:</strong> ${invoice.date || new Date().toLocaleDateString()}</div>
                <div><strong>Due Date:</strong> ${invoice.dueDate || 'Upon receipt'}</div>
                ${invoice.status ? `<div style="margin-top: 8px;"><span class="status-badge ${invoice.status}">${invoice.status}</span></div>` : ''}
              </div>
            </div>
          </div>

          <div class="parties">
            <div class="bill-to">
              <div class="party-label">Bill To</div>
              <div class="party-name">${escapeHtml(client.name) || 'Client Name'}</div>
              <div class="party-details">
                ${escapeHtml(client.company) ? escapeHtml(client.company) + '<br>' : ''}
                ${escapeHtml(client.address) || 'Client Address'}<br>
                ${escapeHtml(client.city) || 'City, State ZIP'}<br>
                ${client.email ? escapeHtml(client.email) : ''}
              </div>
            </div>
            <div class="ship-to">
              <div class="party-label">Payment Details</div>
              <div class="party-details">
                ${invoice.paymentTerms ? `<strong>Terms:</strong> ${escapeHtml(invoice.paymentTerms)}<br>` : ''}
                ${invoice.paymentMethod ? `<strong>Method:</strong> ${escapeHtml(invoice.paymentMethod)}` : ''}
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Tax</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 24px;">No items added yet</td></tr>'}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-table">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>${formatMoney(totals.subtotal)}</span>
              </div>
              ${totals.discount > 0 ? `
                <div class="totals-row">
                  <span>Discount (${data.discountPercent}%${data.discountType === 'fixed' ? ' fixed' : ''})</span>
                  <span>-${formatMoney(totals.discount)}</span>
                </div>
              ` : ''}
              ${totals.tax > 0 ? `
                <div class="totals-row">
                  <span>Tax</span>
                  <span>${formatMoney(totals.tax)}</span>
                </div>
              ` : ''}
              <div class="totals-row grand-total">
                <span>Total</span>
                <span>${formatMoney(totals.total)}</span>
              </div>
            </div>
          </div>

          ${notes ? `
            <div class="invoice-footer">
              <strong>Notes:</strong> ${escapeHtml(notes)}
            </div>
          ` : ''}
        </div>
      `;
    }
  },

  /**
   * Template 2: Modern
   * Dark gradient header with contemporary styling
   */
  modern: {
    name: 'Modern',
    description: 'Contemporary dark header design',
    render: function(data) {
      const { company, client, invoice, items, totals, currency, notes, logoUrl } = data;

      const formatMoney = (amount) => {
        return formatCurrency(amount, currency);
      };

      const itemsHtml = items.map(item => `
        <tr>
          <td>${escapeHtml(item.description) || 'Item description'}</td>
          <td>${item.quantity || 0}</td>
          <td>${formatMoney(item.rate || 0)}</td>
          <td>${item.tax || 0}%</td>
          <td>${formatMoney(item.total || 0)}</td>
        </tr>
      `).join('');

      return `
        <div class="invoice-template modern">
          <div class="invoice-header">
            <div class="company-info">
              ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo" style="max-height: 50px; margin-bottom: 8px;">` : ''}
              <h2>${escapeHtml(company.name) || 'Your Company'}</h2>
              <div class="company-details">
                ${escapeHtml(company.address) || '123 Business Street'} · ${escapeHtml(company.city) || 'City, State'}<br>
                ${company.email ? escapeHtml(company.email) : 'email@company.com'} ${company.phone ? '· ' + escapeHtml(company.phone) : ''}
              </div>
            </div>
            <div class="invoice-title">
              <h1>Invoice</h1>
              <div class="invoice-meta">
                <div>#${escapeHtml(invoice.number) || 'INV-001'}</div>
                <div>${invoice.date || new Date().toLocaleDateString()}</div>
                <div>Due: ${invoice.dueDate || 'Upon receipt'}</div>
                ${invoice.status ? `<span class="status-badge ${invoice.status}">${invoice.status}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="parties">
            <div class="bill-to">
              <div class="party-label">Invoice To</div>
              <div class="party-name">${escapeHtml(client.name) || 'Client Name'}</div>
              <div class="party-details">
                ${escapeHtml(client.company) ? escapeHtml(client.company) + '<br>' : ''}
                ${escapeHtml(client.address) || 'Client Address'}<br>
                ${escapeHtml(client.city) || 'City, State ZIP'}<br>
                ${client.email ? escapeHtml(client.email) : ''}
              </div>
            </div>
            <div class="payment-info">
              <div class="party-label">Payment Info</div>
              <div class="party-details">
                ${invoice.paymentTerms ? `<strong>Terms:</strong> ${escapeHtml(invoice.paymentTerms)}<br>` : ''}
                ${invoice.paymentMethod ? `<strong>Method:</strong> ${escapeHtml(invoice.paymentMethod)}<br>` : ''}
                <strong>Currency:</strong> ${currency}
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Tax</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 32px;">Add line items to your invoice</td></tr>'}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-table">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>${formatMoney(totals.subtotal)}</span>
              </div>
              ${totals.discount > 0 ? `
                <div class="totals-row">
                  <span>Discount</span>
                  <span>-${formatMoney(totals.discount)}</span>
                </div>
              ` : ''}
              ${totals.tax > 0 ? `
                <div class="totals-row">
                  <span>Tax</span>
                  <span>${formatMoney(totals.tax)}</span>
                </div>
              ` : ''}
              <div class="totals-row grand-total">
                <span>Total Due</span>
                <span>${formatMoney(totals.total)}</span>
              </div>
            </div>
          </div>

          <div class="invoice-footer">
            <div>
              ${notes ? `<strong>Notes:</strong> ${escapeHtml(notes)}` : 'Thank you for your business'}
            </div>
            <div>
              ${escapeHtml(company.name) || 'Your Company'}
            </div>
          </div>
        </div>
      `;
    }
  },

  /**
   * Template 3: Minimal
   * Clean, whitespace-focused design
   */
  minimal: {
    name: 'Minimal',
    description: 'Clean, simple, elegant',
    render: function(data) {
      const { company, client, invoice, items, totals, currency, notes, logoUrl } = data;

      const formatMoney = (amount) => {
        return formatCurrency(amount, currency);
      };

      const itemsHtml = items.map(item => `
        <tr>
          <td>${escapeHtml(item.description) || 'Item description'}</td>
          <td>${item.quantity || 0}</td>
          <td>${formatMoney(item.rate || 0)}</td>
          <td>${item.tax || 0}%</td>
          <td>${formatMoney(item.total || 0)}</td>
        </tr>
      `).join('');

      return `
        <div class="invoice-template minimal">
          <div class="invoice-header">
            <div class="company-info">
              ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo" style="max-height: 48px; margin-bottom: 12px;">` : ''}
              <h2>${escapeHtml(company.name) || 'Your Company'}</h2>
              <div class="company-details">
                ${escapeHtml(company.address) || '123 Business Street'}<br>
                ${escapeHtml(company.city) || 'City, State ZIP'}
              </div>
            </div>
            <div class="invoice-title">
              <h1>Invoice</h1>
              <div class="invoice-meta">
                <div><strong>${escapeHtml(invoice.number) || 'INV-001'}</strong></div>
                <div>Date: ${invoice.date || new Date().toLocaleDateString()}</div>
                <div>Due: ${invoice.dueDate || 'Upon receipt'}</div>
                ${invoice.status ? `<div style="margin-top: 8px;"><span class="status-badge ${invoice.status}">${invoice.status}</span></div>` : ''}
              </div>
            </div>
          </div>

          <div class="parties">
            <div class="bill-to">
              <div class="party-label">Billed To</div>
              <div class="party-name">${escapeHtml(client.name) || 'Client Name'}</div>
              <div class="party-details">
                ${escapeHtml(client.company) ? escapeHtml(client.company) + '<br>' : ''}
                ${escapeHtml(client.address) || 'Client Address'}<br>
                ${escapeHtml(client.city) || 'City, State ZIP'}<br>
                ${client.email ? escapeHtml(client.email) : ''}
              </div>
            </div>
            <div class="payment-info">
              <div class="party-label">Payment</div>
              <div class="party-details">
                ${invoice.paymentTerms ? `${escapeHtml(invoice.paymentTerms)}<br>` : ''}
                ${invoice.paymentMethod ? `${escapeHtml(invoice.paymentMethod)}<br>` : ''}
                ${currency}
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Tax</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 32px;">No items</td></tr>'}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-table">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>${formatMoney(totals.subtotal)}</span>
              </div>
              ${totals.discount > 0 ? `
                <div class="totals-row">
                  <span>Discount</span>
                  <span>-${formatMoney(totals.discount)}</span>
                </div>
              ` : ''}
              ${totals.tax > 0 ? `
                <div class="totals-row">
                  <span>Tax</span>
                  <span>${formatMoney(totals.tax)}</span>
                </div>
              ` : ''}
              <div class="totals-row grand-total">
                <span>Total</span>
                <span>${formatMoney(totals.total)}</span>
              </div>
            </div>
          </div>

          <div class="invoice-footer">
            ${notes ? `<div style="margin-bottom: 12px;">${escapeHtml(notes)}</div>` : ''}
            <div>Thank you for your business.</div>
            <div>${escapeHtml(company.name) || 'Your Company'} · ${company.email ? escapeHtml(company.email) : ''} ${company.phone ? '· ' + escapeHtml(company.phone) : ''}</div>
          </div>
        </div>
      `;
    }
  }
};

/**
 * Helper: Format currency
 */
function formatCurrency(amount, currencyCode) {
  const currencies = {
    USD: { symbol: '$', locale: 'en-US' },
    EUR: { symbol: '€', locale: 'de-DE' },
    GBP: { symbol: '£', locale: 'en-GB' },
    JPY: { symbol: '¥', locale: 'ja-JP' },
    CAD: { symbol: 'CA$', locale: 'en-CA' },
    AUD: { symbol: 'A$', locale: 'en-AU' },
    CHF: { symbol: 'CHF', locale: 'de-CH' },
    CNY: { symbol: '¥', locale: 'zh-CN' },
    INR: { symbol: '₹', locale: 'en-IN' },
    BRL: { symbol: 'R$', locale: 'pt-BR' },
    MXN: { symbol: 'MX$', locale: 'es-MX' },
    KRW: { symbol: '₩', locale: 'ko-KR' },
    SEK: { symbol: 'kr', locale: 'sv-SE' },
    NZD: { symbol: 'NZ$', locale: 'en-NZ' },
    SGD: { symbol: 'S$', locale: 'en-SG' },
    HKD: { symbol: 'HK$', locale: 'zh-HK' },
    NOK: { symbol: 'kr', locale: 'nb-NO' },
    TRY: { symbol: '₺', locale: 'tr-TR' },
    RUB: { symbol: '₽', locale: 'ru-RU' },
    ZAR: { symbol: 'R', locale: 'en-ZA' },
    AED: { symbol: 'AED', locale: 'ar-AE' },
    PLN: { symbol: 'zł', locale: 'pl-PL' },
    THB: { symbol: '฿', locale: 'th-TH' },
    PHP: { symbol: '₱', locale: 'en-PH' },
    TWD: { symbol: 'NT$', locale: 'zh-TW' }
  };

  const curr = currencies[currencyCode] || currencies.USD;
  const num = parseFloat(amount) || 0;

  try {
    return new Intl.NumberFormat(curr.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  } catch (e) {
    return curr.symbol + num.toFixed(2);
  }
}

/**
 * Helper: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
