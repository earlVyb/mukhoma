class SettingsController {
    constructor() {
        this.apiService = apiService;
        this.init();
    }

    async init() {
        await this.loadSystemSettings();
        await this.loadSmsSettings();
        await this.loadEmailSettings();
        await this.loadBackupSettings();
        await this.loadUsers();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // System Settings
        document.getElementById('saveSystemSettings').addEventListener('click', () => this.saveSystemSettings());

        // SMS Settings
        document.getElementById('saveSmsSettings').addEventListener('click', () => this.saveSmsSettings());
        document.getElementById('testSms').addEventListener('click', () => this.testSms());

        // Email Settings
        document.getElementById('testEmail').addEventListener('click', () => this.testEmail());
        document.getElementById('saveEmailSettings').addEventListener('click', () => this.saveEmailSettings());

        // Backup Settings
        document.getElementById('manualBackup').addEventListener('click', () => this.createBackup());
        document.getElementById('saveBackupSettings').addEventListener('click', () => this.saveBackupSettings());

        // User Management
        document.getElementById('addUser').addEventListener('click', () => this.showAddUserModal());
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-user')) {
                this.showEditUserModal(e.target.dataset.userId);
            } else if (e.target.classList.contains('delete-user')) {
                this.confirmDeleteUser(e.target.dataset.userId);
            }
        });
    }

    async loadSystemSettings() {
        try {
            const settings = await this.apiService.getSystemSettings();
            this.populateSystemSettings(settings);
        } catch (error) {
            console.error('Error loading system settings:', error);
            this.showError('Failed to load system settings');
        }
    }

    populateSystemSettings(settings) {
        document.getElementById('systemName').value = settings.systemName || '';
        document.getElementById('systemEmail').value = settings.systemEmail || '';
        document.getElementById('currency').value = settings.currency || 'KES';
        document.getElementById('language').value = settings.language || 'en';
        document.getElementById('timezone').value = settings.timezone || 'Africa/Nairobi';
        document.getElementById('dateFormat').value = settings.dateFormat || 'YYYY-MM-DD';
    }

    async saveSystemSettings() {
        const settings = {
            systemName: document.getElementById('systemName').value,
            systemEmail: document.getElementById('systemEmail').value,
            currency: document.getElementById('currency').value,
            language: document.getElementById('language').value,
            timezone: document.getElementById('timezone').value,
            dateFormat: document.getElementById('dateFormat').value
        };

        try {
            const response = await this.apiService.saveSystemSettings(settings);
            if (response.success) {
                this.showSuccess('System settings saved successfully');
            } else {
                this.showError('Failed to save system settings');
            }
        } catch (error) {
            console.error('Error saving system settings:', error);
            this.showError('Failed to save system settings');
        }
    }

    async loadSmsSettings() {
        try {
            const settings = await this.apiService.getSmsSettings();
            this.populateSmsSettings(settings);
        } catch (error) {
            console.error('Error loading SMS settings:', error);
            this.showError('Failed to load SMS settings');
        }
    }

    populateSmsSettings(settings) {
        document.getElementById('smsProvider').value = settings.provider || 'twilio';
        document.getElementById('smsApiKey').value = settings.apiKey || '';
        document.getElementById('senderId').value = settings.senderId || '';
        document.getElementById('testMode').checked = settings.testMode || false;
    }

    async saveSmsSettings() {
        const settings = {
            provider: document.getElementById('smsProvider').value,
            apiKey: document.getElementById('smsApiKey').value,
            senderId: document.getElementById('senderId').value,
            testMode: document.getElementById('testMode').checked
        };

        try {
            const response = await this.apiService.saveSmsSettings(settings);
            if (response.success) {
                this.showSuccess('SMS settings saved successfully');
            } else {
                this.showError('Failed to save SMS settings');
            }
        } catch (error) {
            console.error('Error saving SMS settings:', error);
            this.showError('Failed to save SMS settings');
        }
    }

    async testSms() {
        const testNumber = document.getElementById('testNumber').value;
        if (!testNumber) {
            this.showError('Please enter a test phone number');
            return;
        }

        try {
            const response = await this.apiService.testSms(testNumber);
            if (response.success) {
                this.showSuccess('Test SMS sent successfully');
            } else {
                this.showError('Failed to send test SMS');
            }
        } catch (error) {
            console.error('Error sending test SMS:', error);
            this.showError('Failed to send test SMS');
        }
    }

    async loadEmailSettings() {
        try {
            const settings = await this.apiService.getEmailSettings();
            this.populateEmailSettings(settings);
        } catch (error) {
            console.error('Error loading email settings:', error);
            this.showError('Failed to load email settings');
        }
    }

    populateEmailSettings(settings) {
        document.getElementById('smtpHost').value = settings.smtpHost || '';
        document.getElementById('smtpPort').value = settings.smtpPort || '';
        document.getElementById('smtpUser').value = settings.smtpUser || '';
        document.getElementById('smtpPassword').value = '';
        document.getElementById('fromEmail').value = settings.fromEmail || '';
        document.getElementById('testEmail').value = settings.testEmail || '';
    }

    async saveEmailSettings() {
        const settings = {
            smtpHost: document.getElementById('smtpHost').value,
            smtpPort: document.getElementById('smtpPort').value,
            smtpUser: document.getElementById('smtpUser').value,
            smtpPassword: document.getElementById('smtpPassword').value,
            fromEmail: document.getElementById('fromEmail').value
        };

        try {
            const response = await this.apiService.saveEmailSettings(settings);
            if (response.success) {
                this.showSuccess('Email settings saved successfully');
            } else {
                this.showError('Failed to save email settings');
            }
        } catch (error) {
            console.error('Error saving email settings:', error);
            this.showError('Failed to save email settings');
        }
    }

    async testEmail() {
        const testEmail = document.getElementById('testEmail').value;
        if (!testEmail) {
            this.showError('Please enter a test email address');
            return;
        }

        try {
            const response = await this.apiService.testEmail(testEmail);
            if (response.success) {
                this.showSuccess('Test email sent successfully');
            } else {
                this.showError('Failed to send test email');
            }
        } catch (error) {
            console.error('Error sending test email:', error);
            this.showError('Failed to send test email');
        }
    }

    async loadBackupSettings() {
        try {
            const settings = await this.apiService.getBackupSettings();
            this.populateBackupSettings(settings);
        } catch (error) {
            console.error('Error loading backup settings:', error);
            this.showError('Failed to load backup settings');
        }
    }

    populateBackupSettings(settings) {
        document.getElementById('backupInterval').value = settings.interval || 'daily';
        document.getElementById('backupLocation').value = settings.location || '';
        document.getElementById('retentionPeriod').value = settings.retention || '30';
        document.getElementById('lastBackup').value = settings.lastBackup || 'Never';
    }

    async saveBackupSettings() {
        const settings = {
            interval: document.getElementById('backupInterval').value,
            location: document.getElementById('backupLocation').value,
            retention: document.getElementById('retentionPeriod').value
        };

        try {
            const response = await this.apiService.saveBackupSettings(settings);
            if (response.success) {
                this.showSuccess('Backup settings saved successfully');
            } else {
                this.showError('Failed to save backup settings');
            }
        } catch (error) {
            console.error('Error saving backup settings:', error);
            this.showError('Failed to save backup settings');
        }
    }

    async createBackup() {
        try {
            const response = await this.apiService.createBackup();
            if (response.success) {
                this.showSuccess('Backup created successfully');
                this.loadBackupSettings();
            } else {
                this.showError('Failed to create backup');
            }
        } catch (error) {
            console.error('Error creating backup:', error);
            this.showError('Failed to create backup');
        }
    }

    async loadUsers() {
        try {
            const users = await this.apiService.getUsers();
            this.renderUsersTable(users);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Failed to load users');
        }
    }

    renderUsersTable(users) {
        const table = document.getElementById('usersTable');
        const tbody = table.querySelector('tbody');
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.lastLogin ? dayjs(user.lastLogin).format('YYYY-MM-DD HH:mm') : 'Never'}</td>
                <td>
                    <span class="badge ${this.getUserStatusClass(user.status)}">
                        ${user.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info edit-user" data-user-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-user" data-user-id="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getUserStatusClass(status) {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-success';
            case 'inactive':
                return 'bg-warning';
            case 'suspended':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }

    showAddUserModal() {
        const modal = new bootstrap.Modal(document.createElement('div'));
        modal._element.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New User</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addUserForm">
                            <div class="mb-3">
                                <label class="form-label">Full Name</label>
                                <input type="text" class="form-control" name="fullName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" name="email" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-control" name="password" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Role</label>
                                <select class="form-select" name="role">
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveNewUser()">
                            <i class="fas fa-save"></i> Save
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.show();
    }

    showEditUserModal(userId) {
        const modal = new bootstrap.Modal(document.createElement('div'));
        
        // Load user data
        this.apiService.getUser(userId).then(user => {
            modal._element.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit User</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editUserForm">
                                <input type="hidden" name="id" value="${user.id}">
                                <div class="mb-3">
                                    <label class="form-label">Full Name</label>
                                    <input type="text" class="form-control" name="fullName" value="${user.fullName}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" name="email" value="${user.email}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Role</label>
                                    <select class="form-select" name="role">
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                        <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                                        <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Status</label>
                                    <select class="form-select" name="status">
                                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                                        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                        <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="saveEditedUser(${user.id})">
                                <i class="fas fa-save"></i> Save
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            modal.show();
        });
    }

    async saveNewUser() {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);
        
        try {
            const response = await this.apiService.createUser(Object.fromEntries(formData));
            if (response.success) {
                this.showSuccess('User created successfully');
                this.loadUsers();
                form.reset();
                bootstrap.Modal.getInstance(form.closest('.modal')).hide();
            } else {
                this.showError('Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            this.showError('Failed to create user');
        }
    }

    async saveEditedUser(userId) {
        const form = document.getElementById('editUserForm');
        const formData = new FormData(form);
        
        try {
            const response = await this.apiService.updateUser(userId, Object.fromEntries(formData));
            if (response.success) {
                this.showSuccess('User updated successfully');
                this.loadUsers();
                bootstrap.Modal.getInstance(form.closest('.modal')).hide();
            } else {
                this.showError('Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            this.showError('Failed to update user');
        }
    }

    async confirmDeleteUser(userId) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the user.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await this.apiService.deleteUser(userId);
                    if (response.success) {
                        this.showSuccess('User deleted successfully');
                        this.loadUsers();
                    } else {
                        this.showError('Failed to delete user');
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    this.showError('Failed to delete user');
                }
            }
        });
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    }

    showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            timer: 1500
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsController();
});
