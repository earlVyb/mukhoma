class UnitsController {
    constructor() {
        this.apiService = apiService;
        this.init();
    }

    async init() {
        await this.loadBuildings();
        await this.loadUnits();
        this.setupEventListeners();
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
            this.renderUnits(units);
        } catch (error) {
            console.error('Error loading units:', error);
            this.showError('Failed to load units');
        }
    }

    renderUnits(units) {
        // Grid View
        const gridView = document.getElementById('gridViewContainer');
        gridView.innerHTML = units.map(unit => `
            <div class="unit-card ${unit.status === 'occupied' ? 'occupied' : ''}">
                <div class="unit-header">
                    <h3>Unit ${unit.number}</h3>
                    <span class="status-badge ${unit.status}">${unit.status}</span>
                </div>
                <div class="unit-details">
                    <p><strong>Building:</strong> ${unit.buildingName}</p>
                    <p><strong>Size:</strong> ${unit.size} sq ft</p>
                    <p><strong>Rent:</strong> KSh ${unit.monthlyRent}</p>
                    ${unit.tenant ? `<p><strong>Tenant:</strong> ${unit.tenant}</p>` : ''}
                </div>
                <div class="unit-actions">
                    <button class="btn btn-sm btn-primary edit-btn" data-unit-id="${unit.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-unit-id="${unit.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // List View
        const unitsTable = document.getElementById('unitsTable');
        const tbody = unitsTable.querySelector('tbody');
        tbody.innerHTML = units.map(unit => `
            <tr>
                <td>${unit.number}</td>
                <td>${unit.buildingName}</td>
                <td>${unit.size} sq ft</td>
                <td>
                    <span class="badge ${unit.status}">${unit.status}</span>
                </td>
                <td>${unit.tenant || 'Vacant'}</td>
                <td>KSh ${unit.monthlyRent}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-btn" data-unit-id="${unit.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-unit-id="${unit.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Initialize DataTable
        new DataTable(unitsTable, {
            order: [[0, 'asc']],
            pageLength: 10
        });
    }

    setupEventListeners() {
        // View Toggle
        const gridViewBtn = document.getElementById('gridView');
        const listViewBtn = document.getElementById('listView');
        
        gridViewBtn.addEventListener('click', () => {
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            document.getElementById('gridViewContainer').style.display = 'block';
            document.getElementById('listViewContainer').style.display = 'none';
        });

        listViewBtn.addEventListener('click', () => {
            gridViewBtn.classList.remove('active');
            listViewBtn.classList.add('active');
            document.getElementById('gridViewContainer').style.display = 'none';
            document.getElementById('listViewContainer').style.display = 'block';
        });

        // Add Unit
        const addUnitBtn = document.getElementById('addUnitBtn');
        addUnitBtn.addEventListener('click', () => this.showAddUnitModal());

        // Search
        const searchInput = document.getElementById('unitSearch');
        searchInput.addEventListener('input', () => this.filterUnits(searchInput.value));

        // Filters
        const statusFilter = document.getElementById('statusFilter');
        const buildingFilter = document.getElementById('buildingFilter');
        
        statusFilter.addEventListener('change', () => this.filterUnits());
        buildingFilter.addEventListener('change', () => this.filterUnits());

        // Edit/Delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                this.showEditUnitModal(e.target.dataset.unitId);
            } else if (e.target.classList.contains('delete-btn')) {
                this.confirmDeleteUnit(e.target.dataset.unitId);
            }
        });

        // Save Unit
        const saveUnitBtn = document.getElementById('saveUnitBtn');
        saveUnitBtn.addEventListener('click', () => this.saveUnit());
    }

    async showAddUnitModal() {
        const modal = new bootstrap.Modal(document.getElementById('unitModal'));
        modal.show();
        
        // Reset form
        document.getElementById('unitForm').reset();
        document.getElementById('unitNumber').value = '';
        document.getElementById('unitDescription').value = '';
    }

    async showEditUnitModal(unitId) {
        try {
            const unit = await this.apiService.getUnit(unitId);
            const modal = new bootstrap.Modal(document.getElementById('unitModal'));
            modal.show();

            // Populate form
            document.getElementById('buildingSelect').value = unit.buildingId;
            document.getElementById('unitNumber').value = unit.number;
            document.getElementById('unitSize').value = unit.size;
            document.getElementById('monthlyRent').value = unit.monthlyRent;
            document.getElementById('unitStatus').value = unit.status;
            document.getElementById('unitDescription').value = unit.description;
        } catch (error) {
            console.error('Error loading unit:', error);
            this.showError('Failed to load unit details');
        }
    }

    async saveUnit() {
        const form = document.getElementById('unitForm');
        const formData = {
            buildingId: form.buildingSelect.value,
            number: form.unitNumber.value,
            size: form.unitSize.value,
            monthlyRent: form.monthlyRent.value,
            status: form.unitStatus.value,
            description: form.unitDescription.value
        };

        try {
            const modal = bootstrap.Modal.getInstance(document.getElementById('unitModal'));
            
            if (modal) {
                modal.hide();
            }

            await this.apiService.createUnit(formData);
            await this.loadUnits();
            
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Unit saved successfully',
                timer: 1500
            });
        } catch (error) {
            console.error('Error saving unit:', error);
            this.showError('Failed to save unit');
        }
    }

    async confirmDeleteUnit(unitId) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the unit.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await this.apiService.deleteUnit(unitId);
                    await this.loadUnits();
                    
                    Swal.fire(
                        'Deleted!',
                        'The unit has been deleted.',
                        'success'
                    );
                } catch (error) {
                    console.error('Error deleting unit:', error);
                    this.showError('Failed to delete unit');
                }
            }
        });
    }

    filterUnits(searchText = '') {
        const statusFilter = document.getElementById('statusFilter').value;
        const buildingFilter = document.getElementById('buildingFilter').value;
        
        // Get filtered units from API
        const filteredUnits = this.apiService.getUnits({
            search: searchText,
            status: statusFilter,
            building: buildingFilter
        });

        this.renderUnits(filteredUnits);
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
    new UnitsController();
});
