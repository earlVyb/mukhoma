class ApiService {
    constructor() {
        this.baseUrl = '/api';
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token') || ''
        };
    }

    // Authentication
    async login(credentials) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                this.headers.Authorization = data.token;
                return { success: true, data };
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    async logout() {
        localStorage.removeItem('token');
        this.headers.Authorization = '';
        return { success: true };
    }

    // Units
    async getUnits(params = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/units?${new URLSearchParams(params)}`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching units:', error);
            return { success: false, error: error.message };
        }
    }

    async getUnit(id) {
        try {
            const response = await fetch(`${this.baseUrl}/units/${id}`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching unit:', error);
            return { success: false, error: error.message };
        }
    }

    async createUnit(unitData) {
        try {
            const response = await fetch(`${this.baseUrl}/units`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(unitData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error creating unit:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUnit(id, unitData) {
        try {
            const response = await fetch(`${this.baseUrl}/units/${id}`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(unitData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error updating unit:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteUnit(id) {
        try {
            const response = await fetch(`${this.baseUrl}/units/${id}`, {
                method: 'DELETE',
                headers: this.headers
            });
            return { success: response.ok };
        } catch (error) {
            console.error('Error deleting unit:', error);
            return { success: false, error: error.message };
        }
    }

    // Tenants
    async getTenants(params = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/tenants?${new URLSearchParams(params)}`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching tenants:', error);
            return { success: false, error: error.message };
        }
    }

    async getTenant(id) {
        try {
            const response = await fetch(`${this.baseUrl}/tenants/${id}`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching tenant:', error);
            return { success: false, error: error.message };
        }
    }

    async createTenant(tenantData) {
        try {
            const response = await fetch(`${this.baseUrl}/tenants`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(tenantData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error creating tenant:', error);
            return { success: false, error: error.message };
        }
    }

    async updateTenant(id, tenantData) {
        try {
            const response = await fetch(`${this.baseUrl}/tenants/${id}`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(tenantData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error updating tenant:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteTenant(id) {
        try {
            const response = await fetch(`${this.baseUrl}/tenants/${id}`, {
                method: 'DELETE',
                headers: this.headers
            });
            return { success: response.ok };
        } catch (error) {
            console.error('Error deleting tenant:', error);
            return { success: false, error: error.message };
        }
    }

    // Payments
    async getPayments(params = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/payments?${new URLSearchParams(params)}`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching payments:', error);
            return { success: false, error: error.message };
        }
    }

    async getPayment(id) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/${id}`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching payment:', error);
            return { success: false, error: error.message };
        }
    }

    async createPayment(paymentData) {
        try {
            const response = await fetch(`${this.baseUrl}/payments`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(paymentData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error creating payment:', error);
            return { success: false, error: error.message };
        }
    }

    async updatePayment(id, paymentData) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/${id}`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(paymentData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error updating payment:', error);
            return { success: false, error: error.message };
        }
    }

    async deletePayment(id) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/${id}`, {
                method: 'DELETE',
                headers: this.headers
            });
            return { success: response.ok };
        } catch (error) {
            console.error('Error deleting payment:', error);
            return { success: false, error: error.message };
        }
    }

    // Reports
    async generateReport(reportData) {
        try {
            const response = await fetch(`${this.baseUrl}/reports`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(reportData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error generating report:', error);
            return { success: false, error: error.message };
        }
    }

    async getReportData(reportType, params = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/reports/${reportType}?${new URLSearchParams(params)}`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching report data:', error);
            return { success: false, error: error.message };
        }
    }

    // SMS
    async getSmsTemplates() {
        try {
            const response = await fetch(`${this.baseUrl}/sms/templates`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching SMS templates:', error);
            return { success: false, error: error.message };
        }
    }

    async getSmsHistory(params = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/sms/history?${new URLSearchParams(params)}`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching SMS history:', error);
            return { success: false, error: error.message };
        }
    }

    async sendSms(smsData) {
        try {
            const response = await fetch(`${this.baseUrl}/sms/send`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(smsData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error sending SMS:', error);
            return { success: false, error: error.message };
        }
    }

    async getSms(id) {
        try {
            const response = await fetch(`${this.baseUrl}/sms/${id}`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching SMS:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteSms(id) {
        try {
            const response = await fetch(`${this.baseUrl}/sms/${id}`, {
                method: 'DELETE',
                headers: this.headers
            });
            return { success: response.ok };
        } catch (error) {
            console.error('Error deleting SMS:', error);
            return { success: false, error: error.message };
        }
    }

    // Settings
    async getSystemSettings() {
        try {
            const response = await fetch(`${this.baseUrl}/settings/system`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching system settings:', error);
            return { success: false, error: error.message };
        }
    }

    async saveSystemSettings(settings) {
        try {
            const response = await fetch(`${this.baseUrl}/settings/system`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(settings)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error saving system settings:', error);
            return { success: false, error: error.message };
        }
    }

    async getSmsSettings() {
        try {
            const response = await fetch(`${this.baseUrl}/settings/sms`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching SMS settings:', error);
            return { success: false, error: error.message };
        }
    }

    async saveSmsSettings(settings) {
        try {
            const response = await fetch(`${this.baseUrl}/settings/sms`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(settings)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error saving SMS settings:', error);
            return { success: false, error: error.message };
        }
    }

    async getEmailSettings() {
        try {
            const response = await fetch(`${this.baseUrl}/settings/email`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching email settings:', error);
            return { success: false, error: error.message };
        }
    }

    async saveEmailSettings(settings) {
        try {
            const response = await fetch(`${this.baseUrl}/settings/email`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(settings)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error saving email settings:', error);
            return { success: false, error: error.message };
        }
    }

    async testEmail(emailData) {
        try {
            const response = await fetch(`${this.baseUrl}/settings/email/test`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(emailData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error testing email:', error);
            return { success: false, error: error.message };
        }
    }

    async getBackupSettings() {
        try {
            const response = await fetch(`${this.baseUrl}/settings/backup`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching backup settings:', error);
            return { success: false, error: error.message };
        }
    }

    async saveBackupSettings(settings) {
        try {
            const response = await fetch(`${this.baseUrl}/settings/backup`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(settings)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error saving backup settings:', error);
            return { success: false, error: error.message };
        }
    }

    async createBackup() {
        try {
            const response = await fetch(`${this.baseUrl}/settings/backup/create`, {
                method: 'POST',
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error creating backup:', error);
            return { success: false, error: error.message };
        }
    }

    // Users
    async getUsers(params = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/users?${new URLSearchParams(params)}`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching users:', error);
            return { success: false, error: error.message };
        }
    }

    async getUser(id) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${id}`, {
                headers: this.headers
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error fetching user:', error);
            return { success: false, error: error.message };
        }
    }

    async createUser(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/users`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUser(id, userData) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${id}`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteUser(id) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${id}`, {
                method: 'DELETE',
                headers: this.headers
            });
            return { success: response.ok };
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export the service
export const apiService = new ApiService();
