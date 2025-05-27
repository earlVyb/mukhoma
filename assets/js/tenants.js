class TenantsController {
    constructor() {
        this.apiService = apiService;
        this.selectedTenants = new Set();
        this.init();
    }

    async init() {
        await this.loadBuildings();
        await this.loadUnits();
        await this.loadTenants();
        this.setupEventListeners();
        this.setupDataTable();
    }

    async loadBuildings() {
        try {
            const buildings = await this.apiService.getBuildings();
            const buildingSelect = document.getElementById('buildingSelect');
            const buildingFilter = document.getElementById('buildingFilter');
            
            buildings.forEach(building => {
                const option = document.createElement('option');
                option.value = building.id;
                option.textContent = building.name;
                buildingSelect.appendChild(option.cloneNode(true));
                buildingFilter.appendChild(option.cloneNode(true));
            });
        } catch (error) {
            console.error('Error loading buildings:', error);
            this.showError('Failed to load buildings');
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

    async loadTenants() {
        try {
            const tenants = await this.apiService.getTenants();
            this.renderTenants(tenants);
        } catch (error) {
            console.error('Error loading tenants:', error);
            this.showError('Failed to load tenants');
        }
    }

    renderTenants(tenants) {
        const table = document.getElementById('tenantsTable');
        const tbody = table.querySelector('tbody');
        
        tbody.innerHTML = tenants.map(tenant => `
            <tr>
                <td>
                    <div class="form-check">
                        <input class="form-check-input tenant-checkbox" type="checkbox" 
                               value="${tenant.id}" id="tenant-${tenant.id}">
                    </div>
                </td>
                <td>${tenant.fullName}</td>
                <td>${tenant.phone}</td>
                <td>${tenant.email || 'N/A'}</td>
                <td>${tenant.unit ? `${tenant.unit.buildingName} - Unit ${tenant.unit.number}` : 'Not Assigned'}</td>
                <td>${tenant.moveInDate ? dayjs(tenant.moveInDate).format('YYYY-MM-DD') : ''}</td>
                <td>KSh ${tenant.monthlyRent || 0}</td>
                <td>
                    <span class="badge ${tenant.arrears > 0 ? 'bg-danger' : 'bg-success'}">
                        KSh ${tenant.arrears || 0}
                    </span>
                </td>
                <td>
                    <span class="badge ${tenant.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                        ${tenant.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary edit-btn" data-tenant-id="${tenant.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-tenant-id="${tenant.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Initialize DataTable
        if (!this.dataTable) {
            this.dataTable = new DataTable(table, {
                order: [[1, 'asc']],
                pageLength: 10,
                columnDefs: [
                    { targets: [0], orderable: false }, // Disable sorting for checkbox column
                    { targets: [9], orderable: false } // Disable sorting for actions column
                ]
            });
        } else {
            this.dataTable.clear().rows.add(tenants).draw();
        }
    }

    setupEventListeners() {
        // Add Tenant
        const addTenantBtn = document.getElementById('addTenantBtn');
        addTenantBtn.addEventListener('click', () => this.showAddTenantModal());

        // Bulk SMS
        const bulkSmsBtn = document.getElementById('bulkSmsBtn');
        bulkSmsBtn.addEventListener('click', () => this.showBulkSmsModal());

        // Export
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.addEventListener('click', () => this.exportTenants());

        // Search
        const searchInput = document.getElementById('tenantSearch');
        searchInput.addEventListener('input', () => this.filterTenants(searchInput.value));

        // Filters
        const statusFilter = document.getElementById('statusFilter');
        const buildingFilter = document.getElementById('buildingFilter');
        
        statusFilter.addEventListener('change', () => this.filterTenants());
        buildingFilter.addEventListener('change', () => this.filterTenants());

        // Checkbox selection
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('tenant-checkbox')) {
                if (e.target.checked) {
                    this.selectedTenants.add(e.target.value);
                } else {
                    this.selectedTenants.delete(e.target.value);
                }
                this.updateBulkActions();
            }
        });

        // Edit/Delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                this.showEditTenantModal(e.target.dataset.tenantId);
            } else if (e.target.classList.contains('delete-btn')) {
                this.confirmDeleteTenant(e.target.dataset.tenantId);
            }
        });

        // Save Tenant
        const saveTenantBtn = document.getElementById('saveTenantBtn');
        saveTenantBtn.addEventListener('click', () => this.saveTenant());
    }

    setupDataTable() {
        // DataTable initialization is handled in renderTenants
    }

    async showAddTenantModal() {
        const modal = new bootstrap.Modal(document.getElementById('tenantModal'));
        modal.show();
        
        // Reset form
        document.getElementById('tenantForm').reset();
        document.getElementById('buildingSelect').value = '';
        document.getElementById('unitSelect').value = '';
        document.getElementById('moveInDate').value = '';
        document.getElementById('monthlyRent').value = '';
        document.getElementById('notes').value = '';
    }

    async showEditTenantModal(tenantId) {
        try {
            const tenant = await this.apiService.getTenant(tenantId);
            const modal = new bootstrap.Modal(document.getElementById('tenantModal'));
            modal.show();

            // Populate form
            document.getElementById('firstName').value = tenant.firstName;
            document.getElementById('lastName').value = tenant.lastName;
            document.getElementById('phone').value = tenant.phone;
            document.getElementById('email').value = tenant.email;
            document.getElementById('buildingSelect').value = tenant.unit?.buildingId || '';
            document.getElementById('unitSelect').value = tenant.unitId || '';
            document.getElementById('moveInDate').value = tenant.moveInDate || '';
            document.getElementById('monthlyRent').value = tenant.monthlyRent || '';
            document.getElementById('emergencyContact').value = tenant.emergencyContact || '';
            document.getElementById('notes').value = tenant.notes || '';
        } catch (error) {
            console.error('Error loading tenant:', error);
            this.showError('Failed to load tenant details');
        }
    }

    async saveTenant() {
        const form = document.getElementById('tenantForm');
        const formData = {
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            phone: form.phone.value,
            email: form.email.value,
            buildingId: form.buildingSelect.value,
            unitId: form.unitSelect.value,
            moveInDate: form.moveInDate.value,
            monthlyRent: form.monthlyRent.value,
            emergencyContact: form.emergencyContact.value,
            notes: form.notes.value
        };

        try {
            const modal = bootstrap.Modal.getInstance(document.getElementById('tenantModal'));
            if (modal) {
                modal.hide();
            }

            await this.apiService.createTenant(formData);
            await this.loadTenants();
            
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Tenant saved successfully',
                timer: 1500
            });
        } catch (error) {
            console.error('Error saving tenant:', error);
            this.showError('Failed to save tenant');
        }
    }

    async confirmDeleteTenant(tenantId) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the tenant.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await this.apiService.deleteTenant(tenantId);
                    await this.loadTenants();
                    
                    Swal.fire(
                        'Deleted!',
                        'The tenant has been deleted.',
                        'success'
                    );
                } catch (error) {
                    console.error('Error deleting tenant:', error);
                    this.showError('Failed to delete tenant');
                }
            }
        });
    }

    showBulkSmsModal() {
        if (this.selectedTenants.size === 0) {
            this.showError('Please select at least one tenant');
            return;
        }

        const modal = new bootstrap.Modal(document.getElementById('bulkSmsModal'));
        modal.show();
    }

    async exportTenants() {
        try {
            const tenants = await this.apiService.getTenants();
            const csvContent = this.generateCsv(tenants);
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', 'tenants.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting tenants:', error);
            this.showError('Failed to export tenants');
        }
    }

    generateCsv(tenants) {
        const headers = [
            'First Name', 'Last Name', 'Phone', 'Email', 'Building', 'Unit', 'Move-in Date',
            'Monthly Rent', 'Arrears', 'Status'
        ];

        const rows = tenants.map(tenant => [
            tenant.firstName,
            tenant.lastName,
            tenant.phone,
            tenant.email,
            tenant.unit?.buildingName || '',
            tenant.unit?.number || '',
            tenant.moveInDate || '',
            tenant.monthlyRent || 0,
            tenant.arrears || 0,
            tenant.status
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }

    filterTenants(searchText = '') {
        const statusFilter = document.getElementById('statusFilter').value;
        const buildingFilter = document.getElementById('buildingFilter').value;
        
        // Get filtered tenants from API
        const filteredTenants = this.apiService.getTenants({
            search: searchText,
            status: statusFilter,
            building: buildingFilter
        });

        this.renderTenants(filteredTenants);
    }

    updateBulkActions() {
        const bulkSmsBtn = document.getElementById('bulkSmsBtn');
        bulkSmsBtn.disabled = this.selectedTenants.size === 0;
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
    new TenantsController();
});
