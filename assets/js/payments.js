class PaymentsController {
    constructor() {
        this.apiService = apiService;
        this.selectedPayments = new Set();
        this.init();
    }

    async init() {
        await this.loadTenants();
        await this.loadUnits();
        await this.loadPayments();
        this.setupEventListeners();
        this.setupDataTable();
    }

    async loadTenants() {
        try {
            const tenants = await this.apiService.getTenants();
            const tenantSelect = document.getElementById('tenantSelect');
            
            tenants.forEach(tenant => {
                const option = document.createElement('option');
                option.value = tenant.id;
                option.textContent = `${tenant.fullName} (${tenant.phone})`;
                tenantSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading tenants:', error);
            this.showError('Failed to load tenants');
        }
    }

    async loadUnits() {
        try {
            const units = await this.apiService.getUnits();
            const unitSelect = document.getElementById('unitSelect');
            
            units.forEach(unit => {
                const option = document.createElement('option');
                option.value = unit.id;
                option.textContent = `${unit.buildingName} - Unit ${unit.number}`;
                unitSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading units:', error);
            this.showError('Failed to load units');
        }
    }

    async loadPayments() {
        try {
            const payments = await this.apiService.getPayments();
            this.renderPayments(payments);
        } catch (error) {
            console.error('Error loading payments:', error);
            this.showError('Failed to load payments');
        }
    }

    renderPayments(payments) {
        const table = document.getElementById('paymentsTable');
        const tbody = table.querySelector('tbody');
        
        tbody.innerHTML = payments.map(payment => `
            <tr>
                <td>
                    <div class="form-check">
                        <input class="form-check-input payment-checkbox" type="checkbox" 
                               value="${payment.id}" id="payment-${payment.id}">
                    </div>
                </td>
                <td>${dayjs(payment.date).format('YYYY-MM-DD')}</td>
                <td>${payment.tenant.fullName}</td>
                <td>${payment.unit ? `${payment.unit.buildingName} - Unit ${payment.unit.number}` : 'N/A'}</td>
                <td>${payment.type}</td>
                <td>KSh ${payment.amount}</td>
                <td>${payment.paymentMethod}</td>
                <td>${payment.reference || ''}</td>
                <td>
                    <span class="badge ${this.getStatusClass(payment.status)}">
                        ${payment.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary receipt-btn" data-payment-id="${payment.id}">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    <button class="btn btn-sm btn-info edit-btn" data-payment-id="${payment.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-payment-id="${payment.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Initialize DataTable
        if (!this.dataTable) {
            this.dataTable = new DataTable(table, {
                order: [[1, 'desc']], // Order by date descending
                pageLength: 10,
                columnDefs: [
                    { targets: [0], orderable: false }, // Disable sorting for checkbox column
                    { targets: [9], orderable: false } // Disable sorting for actions column
                ]
            });
        } else {
            this.dataTable.clear().rows.add(payments).draw();
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'paid':
                return 'bg-success';
            case 'pending':
                return 'bg-warning';
            case 'failed':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }

    setupEventListeners() {
        // Add Payment
        const addPaymentBtn = document.getElementById('addPaymentBtn');
        addPaymentBtn.addEventListener('click', () => this.showAddPaymentModal());

        // Bulk Receipts
        const bulkReceiptBtn = document.getElementById('bulkReceiptBtn');
        bulkReceiptBtn.addEventListener('click', () => this.generateBulkReceipts());

        // Search
        const searchInput = document.getElementById('paymentSearch');
        searchInput.addEventListener('input', () => this.filterPayments(searchInput.value));

        // Filters
        const statusFilter = document.getElementById('statusFilter');
        const typeFilter = document.getElementById('typeFilter');
        const dateRange = document.getElementById('dateRange');
        
        statusFilter.addEventListener('change', () => this.filterPayments());
        typeFilter.addEventListener('change', () => this.filterPayments());
        dateRange.addEventListener('change', () => this.filterPayments());

        // Checkbox selection
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('payment-checkbox')) {
                if (e.target.checked) {
                    this.selectedPayments.add(e.target.value);
                } else {
                    this.selectedPayments.delete(e.target.value);
                }
                this.updateBulkActions();
            }
        });

        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('receipt-btn')) {
                this.generateReceipt(e.target.dataset.paymentId);
            } else if (e.target.classList.contains('edit-btn')) {
                this.showEditPaymentModal(e.target.dataset.paymentId);
            } else if (e.target.classList.contains('delete-btn')) {
                this.confirmDeletePayment(e.target.dataset.paymentId);
            }
        });

        // Save Payment
        const savePaymentBtn = document.getElementById('savePaymentBtn');
        savePaymentBtn.addEventListener('click', () => this.savePayment());
    }

    setupDataTable() {
        // DataTable initialization is handled in renderPayments
    }

    async showAddPaymentModal() {
        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();
        
        // Reset form
        document.getElementById('paymentForm').reset();
        document.getElementById('tenantSelect').value = '';
        document.getElementById('unitSelect').value = '';
        document.getElementById('paymentType').value = 'rent';
        document.getElementById('amount').value = '';
        document.getElementById('paymentDate').value = '';
        document.getElementById('paymentMethod').value = 'mpesa';
        document.getElementById('reference').value = '';
        document.getElementById('notes').value = '';
    }

    async showEditPaymentModal(paymentId) {
        try {
            const payment = await this.apiService.getPayment(paymentId);
            const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
            modal.show();

            // Populate form
            document.getElementById('tenantSelect').value = payment.tenantId;
            document.getElementById('unitSelect').value = payment.unitId;
            document.getElementById('paymentType').value = payment.type;
            document.getElementById('amount').value = payment.amount;
            document.getElementById('paymentDate').value = payment.date;
            document.getElementById('paymentMethod').value = payment.paymentMethod;
            document.getElementById('reference').value = payment.reference;
            document.getElementById('notes').value = payment.notes;
        } catch (error) {
            console.error('Error loading payment:', error);
            this.showError('Failed to load payment details');
        }
    }

    async savePayment() {
        const form = document.getElementById('paymentForm');
        const formData = {
            tenantId: form.tenantSelect.value,
            unitId: form.unitSelect.value,
            type: form.paymentType.value,
            amount: form.amount.value,
            date: form.paymentDate.value,
            paymentMethod: form.paymentMethod.value,
            reference: form.reference.value,
            notes: form.notes.value
        };

        try {
            const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
            if (modal) {
                modal.hide();
            }

            await this.apiService.createPayment(formData);
            await this.loadPayments();
            
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Payment saved successfully',
                timer: 1500
            });
        } catch (error) {
            console.error('Error saving payment:', error);
            this.showError('Failed to save payment');
        }
    }

    async confirmDeletePayment(paymentId) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the payment record.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await this.apiService.deletePayment(paymentId);
                    await this.loadPayments();
                    
                    Swal.fire(
                        'Deleted!',
                        'The payment record has been deleted.',
                        'success'
                    );
                } catch (error) {
                    console.error('Error deleting payment:', error);
                    this.showError('Failed to delete payment');
                }
            }
        });
    }

    async generateReceipt(paymentId) {
        try {
            const payment = await this.apiService.getPayment(paymentId);
            
            // Create receipt HTML
            const receiptHtml = `
                <div class="receipt">
                    <h3>Rental Receipt</h3>
                    <p>Date: ${dayjs(payment.date).format('YYYY-MM-DD')}</p>
                    <p>Tenant: ${payment.tenant.fullName}</p>
                    <p>Unit: ${payment.unit ? `${payment.unit.buildingName} - Unit ${payment.unit.number}` : 'N/A'}</p>
                    <p>Type: ${payment.type}</p>
                    <p>Amount: KSh ${payment.amount}</p>
                    <p>Payment Method: ${payment.paymentMethod}</p>
                    <p>Reference: ${payment.reference || 'N/A'}</p>
                    <p>Notes: ${payment.notes || 'N/A'}</p>
                </div>
            `;

            // Create PDF
            const pdf = new jsPDF();
            pdf.html(receiptHtml, {
                callback: function (pdf) {
                    pdf.save(`receipt_${payment.id}.pdf`);
                },
                x: 15,
                y: 15,
                width: 180
            });
        } catch (error) {
            console.error('Error generating receipt:', error);
            this.showError('Failed to generate receipt');
        }
    }

    async generateBulkReceipts() {
        if (this.selectedPayments.size === 0) {
            this.showError('Please select at least one payment');
            return;
        }

        try {
            const payments = await this.apiService.getPayments({
                ids: Array.from(this.selectedPayments)
            });

            // Create PDF with multiple receipts
            const pdf = new jsPDF();
            
            payments.forEach(payment => {
                const receiptHtml = `
                    <div class="receipt">
                        <h3>Rental Receipt</h3>
                        <p>Date: ${dayjs(payment.date).format('YYYY-MM-DD')}</p>
                        <p>Tenant: ${payment.tenant.fullName}</p>
                        <p>Unit: ${payment.unit ? `${payment.unit.buildingName} - Unit ${payment.unit.number}` : 'N/A'}</p>
                        <p>Type: ${payment.type}</p>
                        <p>Amount: KSh ${payment.amount}</p>
                        <p>Payment Method: ${payment.paymentMethod}</p>
                        <p>Reference: ${payment.reference || 'N/A'}</p>
                        <p>Notes: ${payment.notes || 'N/A'}</p>
                    </div>
                `;

                pdf.html(receiptHtml, {
                    callback: function () {
                        pdf.addPage();
                    },
                    x: 15,
                    y: 15,
                    width: 180
                });
            });

            pdf.save('bulk_receipts.pdf');
        } catch (error) {
            console.error('Error generating bulk receipts:', error);
            this.showError('Failed to generate bulk receipts');
        }
    }

    filterPayments(searchText = '') {
        const statusFilter = document.getElementById('statusFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;
        const dateRange = document.getElementById('dateRange').value;
        
        // Get filtered payments from API
        const filteredPayments = this.apiService.getPayments({
            search: searchText,
            status: statusFilter,
            type: typeFilter,
            dateRange: dateRange
        });

        this.renderPayments(filteredPayments);
    }

    updateBulkActions() {
        const bulkReceiptBtn = document.getElementById('bulkReceiptBtn');
        bulkReceiptBtn.disabled = this.selectedPayments.size === 0;
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PaymentsController();
});
