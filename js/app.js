/**
 * Invoice Generator - Main Application Logic
 * Features: Create, edit, save, load, export invoices
 */

(function() {
  'use strict';

  // ============================================
  // State Management
  // ============================================
  const AppState = {
    isPro: false, // Free version by default
    currentTemplate: 'classic',
    theme: localStorage.getItem('invoice-theme') || 'light',
    currency: 'USD',
    logoDataUrl: null,
    invoices: JSON.parse(localStorage.getItem('saved-invoices') || '[]'),

    // Current invoice data
    invoice: {
      company: {
        name: '',
        address: '',
        city: '',
        email: '',
        phone: ''
      },
      client: {
        name: '',
        company: '',
        address: '',
        city: '',
        email: ''
      },
      invoice: {
        number: generateInvoiceNumber(),
        date: formatDate(new Date()),
        dueDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        status: 'draft',
        paymentTerms: 'Net 30',
        paymentMethod: ''
      },
      items: [
        { description: '', quantity: 1, rate: 0, tax: 0, total: 0 }
      ],
      discountPercent: 0,
      discountType: 'percentage',
      notes: ''
    }
  };

  // ============================================
  // Currency Data
  // ============================================
  const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' }
  ];

  // ============================================
  // Initialization
  // ============================================
  document.addEventListener('DOMContentLoaded', initApp);

  function initApp() {
    applyTheme(AppState.theme);
    populateCurrencySelect();
    bindEventListeners();
    loadDraftIfExists();
    updatePreview();
  }

  // ============================================
  // Event Binding
  // ============================================
  function bindEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // Template selector
    document.querySelectorAll('.template-option').forEach(option => {
      option.addEventListener('click', () => selectTemplate(option.dataset.template));
    });

    // Form inputs - live update
    const formInputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    formInputs.forEach(input => {
      input.addEventListener('input', debounce(handleFormChange, 150));
      input.addEventListener('change', handleFormChange);
    });

    // Add item button
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', addLineItem);
    }

    // Logo upload
    const logoUpload = document.getElementById('logoUpload');
    if (logoUpload) {
      logoUpload.addEventListener('change', handleLogoUpload);
    }

    // Action buttons
    document.getElementById('newInvoiceBtn')?.addEventListener('click', newInvoice);
    document.getElementById('saveInvoiceBtn')?.addEventListener('click', saveInvoice);
    document.getElementById('loadInvoiceBtn')?.addEventListener('click', openSavedInvoicesModal);
    document.getElementById('exportPdfBtn')?.addEventListener('click', exportToPdf);
    document.getElementById('printInvoiceBtn')?.addEventListener('click', printInvoice);

    // Discount inputs
    document.getElementById('discountPercent')?.addEventListener('input', handleFormChange);
    document.getElementById('discountType')?.addEventListener('change', handleFormChange);

    // Modal close
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    // Pro button
    document.getElementById('proBtn')?.addEventListener('click', showProModal);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
  }

  // ============================================
  // Theme Management
  // ============================================
  function toggleTheme() {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    applyTheme(AppState.theme);
    localStorage.setItem('invoice-theme', AppState.theme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // ============================================
  // Template Selection
  // ============================================
  function selectTemplate(template) {
    AppState.currentTemplate = template;

    document.querySelectorAll('.template-option').forEach(option => {
      option.classList.toggle('active', option.dataset.template === template);
    });

    updatePreview();
  }

  // ============================================
  // Currency
  // ============================================
  function populateCurrencySelect() {
    const select = document.getElementById('currencySelect');
    if (!select) return;

    CURRENCIES.forEach(curr => {
      const option = document.createElement('option');
      option.value = curr.code;
      option.textContent = `${curr.code} - ${curr.name} (${curr.symbol})`;
      if (curr.code === AppState.currency) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      AppState.currency = e.target.value;
      updatePreview();
    });
  }

  // ============================================
  // Form Handling
  // ============================================
  function handleFormChange() {
    // Update company info
    AppState.invoice.company.name = document.getElementById('companyName')?.value || '';
    AppState.invoice.company.address = document.getElementById('companyAddress')?.value || '';
    AppState.invoice.company.city = document.getElementById('companyCity')?.value || '';
    AppState.invoice.company.email = document.getElementById('companyEmail')?.value || '';
    AppState.invoice.company.phone = document.getElementById('companyPhone')?.value || '';

    // Update client info
    AppState.invoice.client.name = document.getElementById('clientName')?.value || '';
    AppState.invoice.client.company = document.getElementById('clientCompany')?.value || '';
    AppState.invoice.client.address = document.getElementById('clientAddress')?.value || '';
    AppState.invoice.client.city = document.getElementById('clientCity')?.value || '';
    AppState.invoice.client.email = document.getElementById('clientEmail')?.value || '';

    // Update invoice details
    AppState.invoice.invoice.number = document.getElementById('invoiceNumber')?.value || '';
    AppState.invoice.invoice.date = document.getElementById('invoiceDate')?.value || '';
    AppState.invoice.invoice.dueDate = document.getElementById('dueDate')?.value || '';
    AppState.invoice.invoice.status = document.getElementById('invoiceStatus')?.value || 'draft';
    AppState.invoice.invoice.paymentTerms = document.getElementById('paymentTerms')?.value || '';
    AppState.invoice.invoice.paymentMethod = document.getElementById('paymentMethod')?.value || '';

    // Update discount
    AppState.invoice.discountPercent = parseFloat(document.getElementById('discountPercent')?.value) || 0;
    AppState.invoice.discountType = document.getElementById('discountType')?.value || 'percentage';

    // Update notes
    AppState.invoice.notes = document.getElementById('invoiceNotes')?.value || '';

    // Update line items from table
    updateItemsFromTable();

    // Recalculate and update preview
    calculateTotals();
    updatePreview();
    saveDraft();
  }

  function updateItemsFromTable() {
    const rows = document.querySelectorAll('.items-table tbody tr');
    AppState.invoice.items = [];

    rows.forEach(row => {
      const desc = row.querySelector('.item-desc')?.value || '';
      const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
      const rate = parseFloat(row.querySelector('.item-rate')?.value) || 0;
      const tax = parseFloat(row.querySelector('.item-tax')?.value) || 0;
      const total = (qty * rate) * (1 + tax / 100);

      AppState.invoice.items.push({
        description: desc,
        quantity: qty,
        rate: rate,
        tax: tax,
        total: total
      });
    });
  }

  // ============================================
  // Line Items
  // ============================================
  function addLineItem() {
    const tbody = document.querySelector('.items-table tbody');
    if (!tbody) return;

    const rowIndex = tbody.querySelectorAll('tr').length;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <input type="text" class="item-input item-desc" placeholder="Item description" data-row="${rowIndex}">
      </td>
      <td>
        <input type="number" class="item-input item-qty" value="1" min="0" step="1" data-row="${rowIndex}">
      </td>
      <td>
        <input type="number" class="item-input item-rate" value="0.00" min="0" step="0.01" data-row="${rowIndex}">
      </td>
      <td>
        <input type="number" class="item-input item-tax" value="0" min="0" max="100" step="0.1" data-row="${rowIndex}">
      </td>
      <td class="item-total">$0.00</td>
      <td>
        <button class="item-remove" title="Remove item">✕</button>
      </td>
    `;

    // Bind events
    row.querySelectorAll('.item-input').forEach(input => {
      input.addEventListener('input', handleFormChange);
    });

    row.querySelector('.item-remove').addEventListener('click', () => {
      row.remove();
      handleFormChange();
    });

    tbody.appendChild(row);
    row.querySelector('.item-desc').focus();
  }

  function removeLineItem(button) {
    const row = button.closest('tr');
    if (row) {
      row.remove();
      handleFormChange();
    }
  }

  // ============================================
  // Calculations
  // ============================================
  function calculateTotals() {
    let subtotal = 0;
    let totalTax = 0;

    AppState.invoice.items.forEach(item => {
      const lineTotal = item.quantity * item.rate;
      const lineTax = lineTotal * (item.tax / 100);
      subtotal += lineTotal;
      totalTax += lineTax;
    });

    let discount = 0;
    if (AppState.invoice.discountType === 'percentage') {
      discount = subtotal * (AppState.invoice.discountPercent / 100);
    } else {
      discount = AppState.invoice.discountPercent;
    }

    discount = Math.min(discount, subtotal);

    const total = subtotal - discount + totalTax;

    AppState.invoice.totals = {
      subtotal: subtotal,
      discount: discount,
      tax: totalTax,
      total: Math.max(0, total)
    };

    // Update totals display in editor
    updateTotalsDisplay();
  }

  function updateTotalsDisplay() {
    const { subtotal, discount, tax, total } = AppState.invoice.totals;
    const curr = AppState.currency;

    const format = (val) => formatCurrency(val, curr);

    const subtotalEl = document.getElementById('subtotalDisplay');
    const discountEl = document.getElementById('discountDisplay');
    const taxEl = document.getElementById('taxDisplay');
    const totalEl = document.getElementById('totalDisplay');
    const itemTotals = document.querySelectorAll('.item-total');

    if (subtotalEl) subtotalEl.textContent = format(subtotal);
    if (discountEl) discountEl.textContent = '-' + format(discount);
    if (taxEl) taxEl.textContent = format(tax);
    if (totalEl) totalEl.textContent = format(total);

    // Update individual item totals
    AppState.invoice.items.forEach((item, i) => {
      if (itemTotals[i]) {
        itemTotals[i].textContent = format(item.total);
      }
    });

    // Show/hide discount row
    const discountRow = document.getElementById('discountRow');
    if (discountRow) {
      discountRow.style.display = discount > 0 ? 'flex' : 'none';
    }
  }

  // ============================================
  // Preview Rendering
  // ============================================
  function updatePreview() {
    const previewEl = document.getElementById('invoicePreview');
    if (!previewEl) return;

    const template = InvoiceTemplates[AppState.currentTemplate];
    if (!template) return;

    const data = {
      company: AppState.invoice.company,
      client: AppState.invoice.client,
      invoice: AppState.invoice.invoice,
      items: AppState.invoice.items,
      totals: AppState.invoice.totals || { subtotal: 0, discount: 0, tax: 0, total: 0 },
      currency: AppState.currency,
      notes: AppState.invoice.notes,
      logoUrl: AppState.logoDataUrl,
      discountPercent: AppState.invoice.discountPercent,
      discountType: AppState.invoice.discountType
    };

    let html = template.render(data);

    // Add watermark for free version
    if (!AppState.isPro) {
      html = `<div style="position: relative;">${html}<div class="watermark">FREE VERSION</div></div>`;
    }

    previewEl.innerHTML = html;
  }

  // ============================================
  // Logo Upload
  // ============================================
  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be smaller than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      AppState.logoDataUrl = event.target.result;

      // Update upload area to show preview
      const uploadArea = document.getElementById('logoUpload');
      if (uploadArea) {
        uploadArea.classList.add('has-image');
        const preview = uploadArea.querySelector('img') || document.createElement('img');
        preview.src = AppState.logoDataUrl;
        preview.alt = 'Company Logo';
        if (!uploadArea.querySelector('img')) {
          uploadArea.prepend(preview);
        }
      }

      updatePreview();
      showToast('Logo uploaded successfully', 'success');
    };
    reader.readAsDataURL(file);
  }

  // ============================================
  // Save / Load
  // ============================================
  function saveInvoice() {
    const invoiceData = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      savedAt: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(AppState.invoice)),
      template: AppState.currentTemplate,
      currency: AppState.currency,
      logoDataUrl: AppState.logoDataUrl
    };

    // Check if invoice number already exists
    const existingIndex = AppState.invoices.findIndex(
      inv => inv.data.invoice.number === invoiceData.data.invoice.number
    );

    if (existingIndex >= 0) {
      // Update existing
      AppState.invoices[existingIndex] = invoiceData;
      showToast('Invoice updated successfully', 'success');
    } else {
      // Add new
      AppState.invoices.unshift(invoiceData);
      showToast('Invoice saved successfully', 'success');
    }

    localStorage.setItem('saved-invoices', JSON.stringify(AppState.invoices));
  }

  function loadInvoice(id) {
    const invoice = AppState.invoices.find(inv => inv.id === id);
    if (!invoice) return;

    AppState.invoice = JSON.parse(JSON.stringify(invoice.data));
    AppState.currentTemplate = invoice.template || 'classic';
    AppState.currency = invoice.currency || 'USD';
    AppState.logoDataUrl = invoice.logoDataUrl || null;

    // Update form fields
    populateFormFromState();

    // Update template selection
    document.querySelectorAll('.template-option').forEach(option => {
      option.classList.toggle('active', option.dataset.template === AppState.currentTemplate);
    });

    // Update currency
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) currencySelect.value = AppState.currency;

    // Update preview
    calculateTotals();
    updatePreview();
    closeModal();

    showToast('Invoice loaded successfully', 'success');
  }

  function deleteInvoice(id) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    AppState.invoices = AppState.invoices.filter(inv => inv.id !== id);
    localStorage.setItem('saved-invoices', JSON.stringify(AppState.invoices));
    renderSavedInvoices();
    showToast('Invoice deleted', 'success');
  }

  function populateFormFromState() {
    const inv = AppState.invoice;

    // Company
    setFieldValue('companyName', inv.company.name);
    setFieldValue('companyAddress', inv.company.address);
    setFieldValue('companyCity', inv.company.city);
    setFieldValue('companyEmail', inv.company.email);
    setFieldValue('companyPhone', inv.company.phone);

    // Client
    setFieldValue('clientName', inv.client.name);
    setFieldValue('clientCompany', inv.client.company);
    setFieldValue('clientAddress', inv.client.address);
    setFieldValue('clientCity', inv.client.city);
    setFieldValue('clientEmail', inv.client.email);

    // Invoice
    setFieldValue('invoiceNumber', inv.invoice.number);
    setFieldValue('invoiceDate', inv.invoice.date);
    setFieldValue('dueDate', inv.invoice.dueDate);
    setFieldValue('invoiceStatus', inv.invoice.status);
    setFieldValue('paymentTerms', inv.invoice.paymentTerms);
    setFieldValue('paymentMethod', inv.invoice.paymentMethod);

    // Discount
    setFieldValue('discountPercent', inv.discountPercent);
    setFieldValue('discountType', inv.discountType);

    // Notes
    setFieldValue('invoiceNotes', inv.notes);

    // Logo
    if (AppState.logoDataUrl) {
      const uploadArea = document.getElementById('logoUpload');
      if (uploadArea) {
        uploadArea.classList.add('has-image');
        const preview = uploadArea.querySelector('img') || document.createElement('img');
        preview.src = AppState.logoDataUrl;
        preview.alt = 'Company Logo';
        if (!uploadArea.querySelector('img')) {
          uploadArea.prepend(preview);
        }
      }
    }

    // Rebuild items table
    rebuildItemsTable(inv.items);
  }

  function setFieldValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  }

  function rebuildItemsTable(items) {
    const tbody = document.querySelector('.items-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!items || items.length === 0) {
      addLineItem();
      return;
    }

    items.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <input type="text" class="item-input item-desc" placeholder="Item description" value="${escapeAttr(item.description)}" data-row="${index}">
        </td>
        <td>
          <input type="number" class="item-input item-qty" value="${item.quantity}" min="0" step="1" data-row="${index}">
        </td>
        <td>
          <input type="number" class="item-input item-rate" value="${item.rate}" min="0" step="0.01" data-row="${index}">
        </td>
        <td>
          <input type="number" class="item-input item-tax" value="${item.tax}" min="0" max="100" step="0.1" data-row="${index}">
        </td>
        <td class="item-total">${formatCurrency(item.total, AppState.currency)}</td>
        <td>
          <button class="item-remove" title="Remove item">✕</button>
        </td>
      `;

      row.querySelectorAll('.item-input').forEach(input => {
        input.addEventListener('input', handleFormChange);
      });

      row.querySelector('.item-remove').addEventListener('click', () => {
        row.remove();
        handleFormChange();
      });

      tbody.appendChild(row);
    });
  }

  // ============================================
  // Draft Auto-save
  // ============================================
  function saveDraft() {
    try {
      localStorage.setItem('invoice-draft', JSON.stringify({
        data: AppState.invoice,
        template: AppState.currentTemplate,
        currency: AppState.currency,
        logoDataUrl: AppState.logoDataUrl
      }));
    } catch (e) {
      // Silently fail if localStorage is full
    }
  }

  function loadDraftIfExists() {
    try {
      const draft = JSON.parse(localStorage.getItem('invoice-draft'));
      if (draft && draft.data) {
        AppState.invoice = draft.data;
        AppState.currentTemplate = draft.template || 'classic';
        AppState.currency = draft.currency || 'USD';
        AppState.logoDataUrl = draft.logoDataUrl || null;

        populateFormFromState();

        // Update template
        document.querySelectorAll('.template-option').forEach(option => {
          option.classList.toggle('active', option.dataset.template === AppState.currentTemplate);
        });

        // Update currency
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) currencySelect.value = AppState.currency;

        calculateTotals();
      }
    } catch (e) {
      // No draft or corrupted data
    }
  }

  // ============================================
  // New Invoice
  // ============================================
  function newInvoice() {
    if (!confirm('Start a new invoice? Unsaved changes will be lost.')) return;

    AppState.invoice = {
      company: AppState.invoice.company, // Keep company info
      client: { name: '', company: '', address: '', city: '', email: '' },
      invoice: {
        number: generateInvoiceNumber(),
        date: formatDate(new Date()),
        dueDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        status: 'draft',
        paymentTerms: 'Net 30',
        paymentMethod: ''
      },
      items: [{ description: '', quantity: 1, rate: 0, tax: 0, total: 0 }],
      discountPercent: 0,
      discountType: 'percentage',
      notes: ''
    };

    AppState.logoDataUrl = null;

    populateFormFromState();
    calculateTotals();
    updatePreview();

    // Reset logo upload area
    const uploadArea = document.getElementById('logoUpload');
    if (uploadArea) {
      uploadArea.classList.remove('has-image');
      const img = uploadArea.querySelector('img');
      if (img) img.remove();
    }

    showToast('New invoice created', 'success');
  }

  // ============================================
  // Export / Print
  // ============================================
  function exportToPdf() {
    const previewEl = document.getElementById('invoicePreview');
    if (!previewEl) return;

    showToast('Generating PDF...', 'success');

    // Hide watermark for PDF if pro
    const watermark = previewEl.querySelector('.watermark');
    if (watermark && AppState.isPro) {
      watermark.style.display = 'none';
    }

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `invoice-${AppState.invoice.invoice.number || 'draft'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(previewEl).save().then(() => {
      if (watermark && !AppState.isPro) {
        watermark.style.display = '';
      }
      showToast('PDF exported successfully!', 'success');
    }).catch(err => {
      console.error('PDF export error:', err);
      showToast('Failed to export PDF', 'error');
      if (watermark) watermark.style.display = '';
    });
  }

  function printInvoice() {
    window.print();
  }

  // ============================================
  // Modal Management
  // ============================================
  function openSavedInvoicesModal() {
    renderSavedInvoices();
    document.getElementById('modalOverlay')?.classList.add('active');
  }

  function closeModal() {
    document.getElementById('modalOverlay')?.classList.remove('active');
  }

  function renderSavedInvoices() {
    const container = document.getElementById('savedInvoicesList');
    if (!container) return;

    if (AppState.invoices.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📄</div>
          <p>No saved invoices yet</p>
          <p style="font-size: 0.8125rem; margin-top: 8px;">Create and save your first invoice</p>
        </div>
      `;
      return;
    }

    container.innerHTML = AppState.invoices.map(inv => `
      <div class="saved-invoice-item" data-id="${inv.id}">
        <div class="saved-invoice-info">
          <h4>${escapeHtml(inv.data.invoice.number || 'Untitled')}</h4>
          <p>${escapeHtml(inv.data.client.name || 'No client')} · ${escapeHtml(inv.data.invoice.date || 'No date')} · ${formatCurrency(inv.data.totals?.total || 0, inv.currency)}</p>
        </div>
        <div class="saved-invoice-actions">
          <button class="btn btn-sm btn-primary" onclick="window.invoiceApp.loadInvoice('${inv.id}')">Load</button>
          <button class="btn btn-sm btn-danger" onclick="window.invoiceApp.deleteInvoice('${inv.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  }

  function showProModal() {
    alert('PRO VERSION\n\nUpgrade to Pro for just $5/month:\n\n✓ Remove watermark from invoices\n✓ Priority support\n✓ More templates coming soon\n\nContact: pro@invoice-generator.com');
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================
  function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + S = Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveInvoice();
    }
    // Ctrl/Cmd + P = Print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      printInvoice();
    }
    // Escape = Close modal
    if (e.key === 'Escape') {
      closeModal();
    }
  }

  // ============================================
  // Toast Notifications
  // ============================================
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : '✕'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============================================
  // Utility Functions
  // ============================================
  function generateInvoiceNumber() {
    const prefix = 'INV';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}${month}-${random}`;
  }

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // ============================================
  // Public API (for inline event handlers)
  // ============================================
  window.invoiceApp = {
    loadInvoice,
    deleteInvoice
  };

})();
