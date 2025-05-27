class ReportsController {
    constructor() {
        this.apiService = apiService;
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadBuildings();
        this.setupEventListeners();
    }

    async loadBuildings() {
        try {
            const buildings = await this.apiService.getBuildings();
            const buildingSelect = document.getElementById('buildingSelect');
            
            buildings.forEach(building => {
                const option = document.createElement('option');
                option.value = building.id;
                option.textContent = building.name;
                buildingSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading buildings:', error);
            this.showError('Failed to load buildings');
        }
    }

    setupEventListeners() {
        // Report Type Change
        const reportType = document.getElementById('reportType');
        reportType.addEventListener('change', () => this.handleReportTypeChange());

        // Date Range Change
        const dateRange = document.getElementById('dateRange');
        dateRange.addEventListener('change', () => this.handleDateRangeChange());

        // Generate Report
        const generateReportBtn = document.getElementById('generateReportBtn');
        generateReportBtn.addEventListener('click', () => this.generateReport());
    }

    handleReportTypeChange() {
        const reportType = document.getElementById('reportType').value;
        
        // Hide all report sections
        document.querySelectorAll('.report-section').forEach(section => {
            section.classList.add('d-none');
        });

        // Show selected report section
        document.getElementById(`${reportType}Report`).classList.remove('d-none');
    }

    handleDateRangeChange() {
        const dateRange = document.getElementById('dateRange').value;
        const customDateRange = document.getElementById('customDateRange');
        
        if (dateRange === 'custom') {
            customDateRange.classList.remove('d-none');
            const today = new Date();
            document.getElementById('fromDate').value = dayjs(today).subtract(1, 'month').format('YYYY-MM-DD');
            document.getElementById('toDate').value = dayjs(today).format('YYYY-MM-DD');
        } else {
            customDateRange.classList.add('d-none');
        }
    }

    async generateReport() {
        const reportType = document.getElementById('reportType').value;
        const buildingId = document.getElementById('buildingSelect').value;
        const dateRange = document.getElementById('dateRange').value;
        let fromDate = null;
        let toDate = null;

        if (dateRange === 'custom') {
            fromDate = document.getElementById('fromDate').value;
            toDate = document.getElementById('toDate').value;
        }

        try {
            switch (reportType) {
                case 'financial':
                    await this.generateFinancialReport(buildingId, dateRange, fromDate, toDate);
                    break;
                case 'occupancy':
                    await this.generateOccupancyReport(buildingId);
                    break;
                case 'arrears':
                    await this.generateArrearsReport(buildingId, dateRange, fromDate, toDate);
                    break;
                case 'maintenance':
                    await this.generateMaintenanceReport(buildingId, dateRange, fromDate, toDate);
                    break;
            }
        } catch (error) {
            console.error('Error generating report:', error);
            this.showError('Failed to generate report');
        }
    }

    async generateFinancialReport(buildingId, dateRange, fromDate, toDate) {
        try {
            const data = await this.apiService.getFinancialReport({
                buildingId,
                dateRange,
                fromDate,
                toDate
            });

            // Update income chart
            if (this.charts.income) {
                this.charts.income.destroy();
            }
            this.charts.income = new Chart(document.getElementById('incomeChart'), {
                type: 'line',
                data: {
                    labels: data.income.labels,
                    datasets: [{
                        label: 'Income (KSh)',
                        data: data.income.values,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Update payment distribution chart
            if (this.charts.paymentDistribution) {
                this.charts.paymentDistribution.destroy();
            }
            this.charts.paymentDistribution = new Chart(document.getElementById('paymentDistributionChart'), {
                type: 'doughnut',
                data: {
                    labels: data.paymentTypes,
                    datasets: [{
                        data: data.paymentValues,
                        backgroundColor: [
                            'rgb(255, 99, 132)',
                            'rgb(54, 162, 235)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error generating financial report:', error);
            this.showError('Failed to generate financial report');
        }
    }

    async generateOccupancyReport(buildingId) {
        try {
            const data = await this.apiService.getOccupancyReport(buildingId);

            // Update total units
            document.getElementById('totalUnits').textContent = data.totalUnits;
            document.getElementById('occupiedUnits').textContent = data.occupiedUnits;

            // Update occupancy chart
            if (this.charts.occupancy) {
                this.charts.occupancy.destroy();
            }
            this.charts.occupancy = new Chart(document.getElementById('occupancyChart'), {
                type: 'pie',
                data: {
                    labels: ['Occupied', 'Vacant'],
                    datasets: [{
                        data: [data.occupiedUnits, data.totalUnits - data.occupiedUnits],
                        backgroundColor: [
                            'rgb(75, 192, 192)',
                            'rgb(255, 99, 132)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error generating occupancy report:', error);
            this.showError('Failed to generate occupancy report');
        }
    }

    async generateArrearsReport(buildingId, dateRange, fromDate, toDate) {
        try {
            const data = await this.apiService.getArrearsReport({
                buildingId,
                dateRange,
                fromDate,
                toDate
            });

            // Update arrears chart
            if (this.charts.arrears) {
                this.charts.arrears.destroy();
            }
            this.charts.arrears = new Chart(document.getElementById('arrearsChart'), {
                type: 'bar',
                data: {
                    labels: data.arrears.labels,
                    datasets: [{
                        label: 'Arrears (KSh)',
                        data: data.arrears.values,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Update arrears table
            const tbody = document.getElementById('arrearsTableBody');
            tbody.innerHTML = data.arrearsDetails.map(arrear => `
                <tr>
                    <td>${arrear.tenant.fullName}</td>
                    <td>${arrear.unit ? `${arrear.unit.buildingName} - Unit ${arrear.unit.number}` : 'N/A'}</td>
                    <td>KSh ${arrear.amount}</td>
                    <td>${arrear.daysLate}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error generating arrears report:', error);
            this.showError('Failed to generate arrears report');
        }
    }

    async generateMaintenanceReport(buildingId, dateRange, fromDate, toDate) {
        try {
            const data = await this.apiService.getMaintenanceReport({
                buildingId,
                dateRange,
                fromDate,
                toDate
            });

            // Update maintenance chart
            if (this.charts.maintenance) {
                this.charts.maintenance.destroy();
            }
            this.charts.maintenance = new Chart(document.getElementById('maintenanceChart'), {
                type: 'bar',
                data: {
                    labels: data.statusLabels,
                    datasets: [{
                        label: 'Maintenance Issues',
                        data: data.statusCounts,
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Update maintenance table
            const tbody = document.getElementById('maintenanceTableBody');
            tbody.innerHTML = data.issues.map(issue => `
                <tr>
                    <td>${issue.buildingName}</td>
                    <td>${issue.unit ? `${issue.unit.buildingName} - Unit ${issue.unit.number}` : 'N/A'}</td>
                    <td>${issue.issue}</td>
                    <td>
                        <span class="badge ${this.getStatusClass(issue.status)}">
                            ${issue.status}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${this.getPriorityClass(issue.priority)}">
                            ${issue.priority}
                        </span>
                    </td>
                    <td>${dayjs(issue.reportedDate).format('YYYY-MM-DD')}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error generating maintenance report:', error);
            this.showError('Failed to generate maintenance report');
        }
    }

    getStatusClass(status) {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-success';
            case 'in progress':
                return 'bg-warning';
            case 'pending':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    }

    getPriorityClass(priority) {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'bg-danger';
            case 'medium':
                return 'bg-warning';
            case 'low':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
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
    new ReportsController();
});
