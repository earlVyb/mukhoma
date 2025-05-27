class DashboardController {
    constructor() {
        this.apiService = apiService;
        this.init();
    }

    async init() {
        await this.loadStatistics();
        await this.loadRecentPayments();
        this.setupEventListeners();
        this.setupCharts();
    }

    async loadStatistics() {
        try {
            const stats = await this.apiService.getReports({ type: 'dashboard' });
            
            document.getElementById('totalUnits').textContent = stats.totalUnits;
            document.getElementById('occupiedUnits').textContent = stats.occupiedUnits;
            document.getElementById('totalRevenue').textContent = `KSh ${stats.totalRevenue}`;
            document.getElementById('totalArrears').textContent = `KSh ${stats.totalArrears}`;
        } catch (error) {
            console.error('Error loading statistics:', error);
            this.showError('Failed to load dashboard statistics');
        }
    }

    async loadRecentPayments() {
        try {
            const payments = await this.apiService.getPayments();
            const table = document.getElementById('recentPaymentsTable');
            const tbody = table.querySelector('tbody');
            
            tbody.innerHTML = payments.map(payment => `
                <tr>
                    <td>${payment.tenantName}</td>
                    <td>KSh ${payment.amount}</td>
                    <td>${payment.type}</td>
                    <td>${dayjs(payment.date).format('YYYY-MM-DD')}</td>
                    <td>
                        <span class="badge ${payment.status === 'paid' ? 'bg-success' : 'bg-danger'}">
                            ${payment.status}
                        </span>
                    </td>
                </tr>
            `).join('');

            // Initialize DataTable
            new DataTable(table, {
                order: [[3, 'desc']], // Order by date descending
                pageLength: 10
            });
        } catch (error) {
            console.error('Error loading payments:', error);
            this.showError('Failed to load recent payments');
        }
    }

    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('collapsed');
                document.querySelector('.main-content').classList.toggle('collapsed');
            });
        }

        // Page resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    setupCharts() {
        // Revenue Chart
        new Chart(document.getElementById('revenueChart'), {
            type: 'line',
            data: {
                labels: [], // Will be populated from API
                datasets: [{
                    label: 'Monthly Revenue',
                    data: [],
                    borderColor: '#2563eb',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });

        // Occupancy Chart
        new Chart(document.getElementById('occupancyChart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Occupancy Rate',
                    data: [],
                    backgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    handleResize() {
        // Update chart sizes
        const charts = Chart.instances;
        charts.forEach(chart => chart.resize());
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardController();
});
