class SMSController {
    constructor() {
        this.apiService = apiService;
        this.selectedTenants = new Set();
        this.init();
    }

    async init() {
        await this.loadTemplates();
        await this.loadSmsHistory();
        this.setupEventListeners();
        this.setupDataTable();
    }

    async loadTemplates() {
        try {
            const templates = await this.apiService.getSmsTemplates();
            this.templates = templates;
        } catch (error) {
            console.error('Error loading templates:', error);
            this.showError('Failed to load SMS templates');
        }
    }

    async loadSmsHistory() {
        try {
            const smsHistory = await this.apiService.getSmsHistory();
            this.renderSmsHistory(smsHistory);
        } catch (error) {
            console.error('Error loading SMS history:', error);
            this.showError('Failed to load SMS history');
        }
    }

    renderSmsHistory(smsHistory) {
        const table = document.getElementById('smsTable');
        const tbody = table.querySelector('tbody');
        
        tbody.innerHTML = smsHistory.map(sms => `
            <tr>
                <td>${dayjs(sms.date).format('YYYY-MM-DD HH:mm')}</td>
                <td>${sms.recipients.length} tenants</td>
                <td>${sms.message.substring(0, 50)}${sms.message.length > 50 ? '...' : ''}</td>
                <td>
                    <span class="badge ${this.getStatusClass(sms.status)}">
                        ${sms.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info view-btn" data-sms-id="${sms.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-sms-id="${sms.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Initialize DataTable
        if (!this.dataTable) {
            this.dataTable = new DataTable(table, {
                order: [[0, 'desc']], // Order by date descending
                pageLength: 10,
                columnDefs: [
                    { targets: [4], orderable: false } // Disable sorting for actions column
                ]
            });
        } else {
            this.dataTable.clear().rows.add(smsHistory).draw();
        }
    }

    getStatusClass(status) {
        switch (status.toLowerCase()) {
            case 'sent':
                return 'bg-success';
            case 'failed':
                return 'bg-danger';
            case 'pending':
                return 'bg-warning';
            default:
                return 'bg-secondary';
        }
    }

    setupEventListeners() {
        // Send to All Tenants
        const sendToAll = document.getElementById('sendToAll');
        sendToAll.addEventListener('change', () => {
            if (sendToAll.checked) {
                document.getElementById('sendToArrears').checked = false;
            }
            this.updateSelectedTenants();
        });

        // Send to Tenants with Arrears
        const sendToArrears = document.getElementById('sendToArrears');
        sendToArrears.addEventListener('change', () => {
            if (sendToArrears.checked) {
                document.getElementById('sendToAll').checked = false;
            }
            this.updateSelectedTenants();
        });

        // Send SMS
        const sendSmsBtn = document.getElementById('sendSmsBtn');
        sendSmsBtn.addEventListener('click', () => this.sendSms());

        // Message input
        const messageInput = document.getElementById('message');
        messageInput.addEventListener('input', () => this.updateCharacterCount());

        // Status Filter
        const statusFilter = document.getElementById('statusFilter');
        statusFilter.addEventListener('change', () => this.filterSmsHistory());

        // Search SMS
        const searchSms = document.getElementById('searchSms');
        searchSms.addEventListener('input', () => this.filterSmsHistory());

        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-btn')) {
                this.showSmsDetails(e.target.dataset.smsId);
            } else if (e.target.classList.contains('delete-btn')) {
                this.confirmDeleteSms(e.target.dataset.smsId);
            }
        });
    }

    updateSelectedTenants() {
        const sendToAll = document.getElementById('sendToAll').checked;
        const sendToArrears = document.getElementById('sendToArrears').checked;
        const selectedTenantsDiv = document.getElementById('selectedTenants');

        if (sendToAll || sendToArrears) {
            selectedTenantsDiv.classList.remove('d-none');
            this.selectedTenants.clear();

            if (sendToAll) {
                // Load all tenants
                this.apiService.getTenants().then(tenants => {
                    this.selectedTenants = new Set(tenants.map(t => t.id));
                    this.updateSelectedTenantsList();
                });
            } else if (sendToArrears) {
                // Load tenants with arrears
                this.apiService.getTenantsWithArrears().then(tenants => {
                    this.selectedTenants = new Set(tenants.map(t => t.id));
                    this.updateSelectedTenantsList();
                });
            }
        } else {
            selectedTenantsDiv.classList.add('d-none');
        }
    }

    updateSelectedTenantsList() {
        const list = document.getElementById('selectedTenantsList');
        list.innerHTML = '';

        if (this.selectedTenants.size === 0) {
            list.innerHTML = '<p>No tenants selected</p>';
            return;
        }

        // Get tenant details
        this.apiService.getTenants({
            ids: Array.from(this.selectedTenants)
        }).then(tenants => {
            list.innerHTML = tenants.map(tenant => `
                <div class="tenant-item">
                    <span>${tenant.fullName}</span>
                    <small>${tenant.unit ? `${tenant.unit.buildingName} - Unit ${tenant.unit.number}` : 'N/A'}</small>
                </div>
            `).join('');
        });
    }

    updateCharacterCount() {
        const message = document.getElementById('message').value;
        const charCount = message.length;
        const messageCount = Math.ceil(charCount / 160);

        document.getElementById('charCount').textContent = charCount;
        document.getElementById('messageCount').textContent = messageCount;

        // Update button state
        const sendSmsBtn = document.getElementById('sendSmsBtn');
        sendSmsBtn.disabled = charCount === 0 || messageCount > 3;
    }

    async sendSms() {
        const message = document.getElementById('message').value;
        const sendToAll = document.getElementById('sendToAll').checked;
        const sendToArrears = document.getElementById('sendToArrears').checked;

        if (!this.selectedTenants.size) {
            this.showError('Please select recipients');
            return;
        }

        try {
            const response = await this.apiService.sendSms({
                message,
                tenantIds: Array.from(this.selectedTenants),
                sendToAll,
                sendToArrears
            });

            if (response.success) {
                await this.loadSmsHistory();
                this.clearForm();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'SMS sent successfully',
                    timer: 1500
                });
            } else {
                this.showError('Failed to send SMS');
            }
        } catch (error) {
            console.error('Error sending SMS:', error);
            this.showError('Failed to send SMS');
        }
    }

    clearForm() {
        document.getElementById('smsForm').reset();
        document.getElementById('sendToAll').checked = false;
        document.getElementById('sendToArrears').checked = false;
        document.getElementById('selectedTenants').classList.add('d-none');
        this.selectedTenants.clear();
        this.updateCharacterCount();
    }

    async showSmsDetails(smsId) {
        try {
            const sms = await this.apiService.getSms(smsId);
            
            // Create modal
            const modal = new bootstrap.Modal(document.createElement('div'));
            modal._element.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">SMS Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Date:</h6>
                                    <p>${dayjs(sms.date).format('YYYY-MM-DD HH:mm')}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Status:</h6>
                                    <span class="badge ${this.getStatusClass(sms.status)}">
                                        ${sms.status}
                                    </span>
                                </div>
                            </div>
                            <div class="mt-3">
                                <h6>Message:</h6>
                                <p>${sms.message}</p>
                            </div>
                            <div class="mt-3">
                                <h6>Recipients (${sms.recipients.length}):
                                    <span class="badge bg-info ms-2">${sms.recipients.length}</span>
                                </h6>
                                <div class="recipients-list">
                                    ${sms.recipients.map(r => `
                                        <div class="recipient-item">
                                            <span>${r.tenant.fullName}</span>
                                            <small>${r.tenant.unit ? `${r.tenant.unit.buildingName} - Unit ${r.tenant.unit.number}` : 'N/A'}</small>
                                            <small class="text-muted">${r.phone}</small>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            modal.show();
        } catch (error) {
            console.error('Error loading SMS details:', error);
            this.showError('Failed to load SMS details');
        }
    }

    async confirmDeleteSms(smsId) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the SMS record.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await this.apiService.deleteSms(smsId);
                    await this.loadSmsHistory();
                    
                    Swal.fire(
                        'Deleted!',
                        'The SMS record has been deleted.',
                        'success'
                    );
                } catch (error) {
                    console.error('Error deleting SMS:', error);
                    this.showError('Failed to delete SMS');
                }
            }
        });
    }

    filterSmsHistory() {
        const statusFilter = document.getElementById('statusFilter').value;
        const searchValue = document.getElementById('searchSms').value;
        
        // Get filtered SMS history from API
        const filteredSms = this.apiService.getSmsHistory({
            status: statusFilter,
            search: searchValue
        });

        this.renderSmsHistory(filteredSms);
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    }
}

// Template functions
function insertTemplate(templateType) {
    const messageInput = document.getElementById('message');
    const templates = {
        paymentReminder: "Dear {tenant_name}, please remember to pay your rent for Unit {unit_number} at {building_name}. Current arrears: KSh {arrears_amount}.",
        maintenanceNotice: "Dear {tenant_name}, there will be maintenance work at Unit {unit_number} on {date}. Please ensure the unit is accessible.",
        generalNotice: "Dear {tenant_name}, this is a general notice regarding {subject}. Please contact the management for more details."
    };

    messageInput.value = templates[templateType];
    updateCharacterCount();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SMSController();
});
