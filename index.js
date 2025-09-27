<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health Log Tracker</title>
    <!-- Load Juris.js (State Management) -->
    <script src="https://unpkg.com/juris@latest/dist/juris.min.js"></script>
    <!-- Load Chart.js for visualization -->
    <script src="https://unpkg.com/chart.js@4.4.2/dist/chart.umd.js"></script>
    
    <style>
        /* Base Styles */
        body {
            font-family: sans-serif;
            background-color: #f9fafb; 
            min-height: 100vh;
            margin: 0;
        }
        
        .app-container {
            padding: 1.5rem 1rem; 
            max-width: 1280px; 
            margin-left: auto;
            margin-right: auto;
        }
    
        /* Card/Form Styles */
        .form-card {
            background-color: #fff;
            padding: 1.5rem;
            border-radius: 0.75rem; 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); 
            border: 1px solid #ebf4ff; 
        }
        
        .form-header {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e40af; 
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.5rem;
        }
    
        /* Form Grid Layout - Mobile First (1 column) */
        .form-grid {
            display: grid;
            grid-template-columns: repeat(1, minmax(0, 1fr));
            gap: 1.5rem;
        }
        @media (min-width: 640px) { /* sm breakpoint (2 columns) */
            .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .col-span-sm-2 { grid-column: span 2 / span 2; }
        }
        @media (min-width: 1024px) { /* lg breakpoint (3 columns) */
            .form-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .col-span-lg-1 { grid-column: span 1 / span 1; }
        }
        .col-span-full { grid-column: 1 / -1; }
    
        /* Input Styles */
        .label-text {
            font-size: 0.875rem; 
            font-weight: 500;
            color: #4b5563; 
            display: block;
            margin-bottom: 0.25rem;
        }
        .input-field {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #d1d5db; 
            border-radius: 0.5rem; 
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); 
            transition: all 0.15s;
        }
        .input-field:focus {
            outline: none;
            border-color: #3b82f6; 
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); 
        }
    
        /* Button Styles */
        .btn-primary {
            padding: 0.75rem 1.5rem;
            background-color: #2563eb; 
            color: #fff;
            font-weight: 600;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); 
            transition: background-color 0.2s;
            border: none;
            cursor: pointer;
        }
        .btn-primary:hover {
            background-color: #1d4ed8; 
        }
        .flex-end { display: flex; justify-content: flex-end; margin-top: 1rem; }
    
    
        /* Header and View Selector */
        .data-header {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 1rem;
            margin-top: 2.5rem;
        }
        .data-header h2 {
            font-size: 1.875rem; 
            font-weight: 800;
            color: #111827; 
            margin-bottom: 1rem;
        }
        @media (min-width: 640px) {
            .data-header {
                flex-direction: row;
                align-items: center;
            }
            .data-header h2 { margin-bottom: 0; }
        }
    
        .view-tabs {
            display: flex;
            gap: 0.5rem;
        }
        .view-tab, .view-tab-active {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 500;
            border-radius: 9999px; 
            border: none;
            cursor: pointer;
            transition: all 0.2s;
        }
        .view-tab-active {
            background-color: #2563eb; 
            color: #fff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
        }
        .view-tab {
            background-color: #e5e7eb; 
            color: #4b5563; 
        }
        .view-tab:hover {
            background-color: #d1d5db; 
        }
    
        /* Table View */
        .table-container {
            overflow-x: auto; 
            background-color: #fff;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }
        .data-table thead { background-color: #f9fafb; }
        .data-table th, .data-table td {
            padding: 0.75rem 1.5rem;
            text-align: left;
            font-size: 0.875rem;
            white-space: nowrap;
            border-bottom: 1px solid #e5e7eb;
        }
        .data-table th {
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .data-table tbody tr:hover { background-color: #f9fafb; }
        .text-medium { font-weight: 500; color: #1f2937; }
        .text-normal { color: #6b7280; }
    
        /* Card View - Mobile First (1 column) */
        .card-grid {
            display: grid;
            grid-template-columns: repeat(1, minmax(0, 1fr));
            gap: 1.5rem;
        }
        @media (min-width: 768px) { /* md breakpoint (2 columns) */
            .card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 1280px) { /* xl breakpoint (3 columns) */
            .card-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
    
        .data-card {
            background-color: #fff;
            padding: 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border: 1px solid #f3f4f6;
            transition: box-shadow 0.3s;
        }
        .data-card:hover {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .card-date {
            font-size: 0.75rem;
            font-weight: 600;
            color: #2563eb;
            margin-bottom: 0.5rem;
        }
        .card-metric-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1rem;
        }
        .metric-item {
            padding: 0.75rem;
            border-radius: 0.5rem;
        }
        .metric-label {
            font-size: 0.75rem;
            color: #6b7280;
        }
        .metric-value {
            font-size: 1.25rem;
            font-weight: 700;
        }
        .bg-blue { background-color: #eff6ff; } .text-blue { color: #1e40af; }
        .bg-green { background-color: #ecfdf5; } .text-green { color: #065f46; }
        .bg-red { background-color: #fef2f2; } .text-red { color: #991b1b; }
        .bg-yellow { background-color: #fffdf2; } .text-yellow { color: #92400e; }
        .bg-purple { background-color: #f5f3ff; } .text-purple { color: #5b21b6; }
        .col-span-2 { grid-column: span 2 / span 2; }
    
        /* Charts View */
        .chart-container-wrapper {
            background-color: #fff;
            padding: 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            border: 1px solid #f3f4f6;
        }
        .chart-container {
            height: 24rem; 
            width: 100%;
        }
    
        /* Utility/Messaging */
        .space-y-10 > * + * { margin-top: 2.5rem; }
        .loading-message, .empty-message {
            text-align: center;
            padding: 2.5rem;
            font-size: 1.25rem;
            color: #6b7280;
            background-color: #fff;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
    
        /* Alert Styles */
        .alert {
            padding: 0.75rem;
            margin-bottom: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-width: 1px;
        }
        .alert-success {
            background-color: #d1fae5; 
            border-color: #34d399; 
            color: #065f46; 
        }
        .alert-error {
            background-color: #fee2e2; 
            border-color: #f87171; 
            color: #991b1b; 
        }
    </style>
</head>
<body class="font-sans min-h-screen">

    <div id="app" class="app-container">
        <!-- Application will mount here -->
    </div>

    <script>
        // --- CONFIGURATION ---
        // NOTE: This URL must point to your running Deno server's API endpoint
        const API_BASE_URL = 'http://localhost:8000/api/logs';
        const VIEW_TYPES = ['Charts', 'Table', 'Cards'];
        // ---------------------

        // Initialize state management
        const state = new State({
            logs: [],
            loading: true,
            currentView: VIEW_TYPES[0], // Start with Charts
            form: {
                // Initialize datetime to the current local time for convenience
                datetime: new Date().toISOString().substring(0, 16),
                weight: '', // lbs
                bs: '',     // mg/dL
                pulse: '',
                systolic: '',
                diastolic: '',
                a1c: '',
            },
            message: null,
            chartInstance: null
        });

        // Utility to format date for display
        const formatDateTime = (isoString) => {
            if (!isoString) return 'N/A';
            try {
                const date = new Date(isoString);
                return date.toLocaleString('en-US', { 
                    year: 'numeric', month: 'short', day: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                });
            } catch (e) {
                return isoString.substring(0, 10);
            }
        };

        // --- Data Fetching and Submission ---

        /** Fetches all health logs from the Deno API */
        const fetchLogs = async () => {
            state.loading = true;
            try {
                const response = await fetch(API_BASE_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                state.logs = data;
                renderCharts(data); 
            } catch (error) {
                state.message = { type: 'error', text: `Error loading data: ${error.message}. Ensure Deno server is running.` };
                console.error("Error fetching logs:", error);
            } finally {
                state.loading = false;
            }
        };

        /** Handles form submission to save new log */
        const handleSubmit = async (e) => {
            e.preventDefault();
            
            const form = state.form;
            
            // Basic required field validation
            if (!form.weight || !form.bs || !form.pulse || !form.systolic || !form.diastolic) {
                state.message = { type: 'error', text: 'Please fill in Weight, BS, Pulse, Systolic, and Diastolic fields.' };
                setTimeout(() => { state.message = null; }, 5000);
                return;
            }

            // Construct new log object
            const newLog = {
                datetime: form.datetime,
                weight: parseFloat(form.weight),
                bs: parseInt(form.bs),
                pulse: parseInt(form.pulse),
                systolic: parseInt(form.systolic),
                diastolic: parseInt(form.diastolic),
                bp: `${form.systolic}/${form.diastolic}`,
                a1c: form.a1c ? parseFloat(form.a1c) : null,
            };

            try {
                const response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newLog)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                await response.json();
                state.message = { type: 'success', text: 'Log entry saved successfully!' };

                // Reset form fields and refresh data
                state.form = { 
                    ...state.form, 
                    datetime: new Date().toISOString().substring(0, 16), 
                    weight: '', bs: '', pulse: '', systolic: '', diastolic: '', a1c: '' 
                };
                fetchLogs();

            } catch (error) {
                state.message = { type: 'error', text: `Failed to save log: ${error.message}. Check Deno server status.` };
                console.error("Submission error:", error);
            }
            
            // Clear message after 5 seconds
            setTimeout(() => { state.message = null; }, 5000);
        };

        /** Renders the Chart.js instances */
        const renderCharts = (logs) => {
            // Destroy previous chart instance if it exists
            if (state.chartInstance) {
                state.chartInstance.destroy();
                state.chartInstance = null;
            }

            // Sort logs chronologically for chart display (oldest first)
            const sortedLogs = logs.slice().sort((a, b) => new Date(a.datetime) - new Date(b.datetime)); 

            const dates = sortedLogs.map(log => formatDateTime(log.datetime));
            const weights = sortedLogs.map(log => log.weight);
            const bloodSugar = sortedLogs.map(log => log.bs);
            const systolic = sortedLogs.map(log => log.systolic);
            const diastolic = sortedLogs.map(log => log.diastolic);

            const ctx = document.getElementById('healthChart');
            if (!ctx) return; 

            state.chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [
                        {
                            label: 'Weight (lbs)',
                            data: weights,
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            yAxisID: 'yWeight',
                        },
                        {
                            label: 'Blood Sugar (mg/dL)',
                            data: bloodSugar,
                            borderColor: 'rgb(54, 162, 235)',
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            yAxisID: 'yBS',
                        },
                        {
                            label: 'Systolic BP',
                            data: systolic,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            yAxisID: 'yBP',
                            tension: 0.2,
                            hidden: true // Hide by default as it shares the right axis with diastolic
                        },
                        {
                            label: 'Diastolic BP',
                            data: diastolic,
                            borderColor: 'rgb(153, 102, 255)',
                            backgroundColor: 'rgba(153, 102, 255, 0.5)',
                            yAxisID: 'yBP',
                            tension: 0.2,
                            hidden: true // Hide by default
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Date/Time' },
                            ticks: { maxRotation: 45, minRotation: 45 }
                        },
                        yWeight: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: 'Weight (lbs)' },
                            grid: { drawOnChartArea: false } 
                        },
                        yBS: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: { display: true, text: 'Blood Sugar (mg/dL)' },
                            grid: { drawOnChartArea: false }
                        },
                        yBP: {
                            type: 'linear',
                            display: false, // Hidden but used for scaling the BP lines together
                            position: 'right'
                        }
                    }
                }
            });
        };


        // --- Component Rendering ---

        /** Component for the Input Form */
        const HealthForm = (state) => {
            
            // Input change handler
            const handleChange = (field) => (e) => {
                state.form[field] = e.target.value;
            };

            return j.div({ class: 'form-card' },
                j.h2({ class: 'form-header' }, 'New Health Entry'),
                state.message && Alert(state.message),
                j.form({ onSubmit: handleSubmit, class: 'form-grid' },
                    // Datetime Picker
                    j.div({ class: 'col-span-full col-span-sm-2 col-span-lg-1' },
                        j.label({ for: 'datetime', class: 'label-text' }, 'Date & Time'),
                        j.input({
                            id: 'datetime',
                            type: 'datetime-local',
                            class: 'input-field',
                            value: state.form.datetime,
                            onChange: handleChange('datetime'),
                            required: true
                        })
                    ),
                    
                    // Weight (lbs)
                    j.div({},
                        j.label({ for: 'weight', class: 'label-text' }, 'Weight (lbs)'),
                        j.input({
                            id: 'weight',
                            type: 'number',
                            step: '0.1',
                            class: 'input-field',
                            value: state.form.weight,
                            onChange: handleChange('weight'),
                            placeholder: 'Pounds',
                            required: true
                        })
                    ),
                    
                    // Blood Sugar (mg/dL)
                    j.div({},
                        j.label({ for: 'bs', class: 'label-text' }, 'Blood Sugar (mg/dL)'),
                        j.input({
                            id: 'bs',
                            type: 'number',
                            class: 'input-field',
                            value: state.form.bs,
                            onChange: handleChange('bs'),
                            placeholder: 'mg/dL',
                            required: true
                        })
                    ),
                    
                    // Pulse
                    j.div({},
                        j.label({ for: 'pulse', class: 'label-text' }, 'Pulse (BPM)'),
                        j.input({
                            id: 'pulse',
                            type: 'number',
                            class: 'input-field',
                            value: state.form.pulse,
                            onChange: handleChange('pulse'),
                            placeholder: 'BPM',
                            required: true
                        })
                    ),

                    // Systolic BP
                    j.div({},
                        j.label({ for: 'systolic', class: 'label-text' }, 'Systolic (BP Top)'),
                        j.input({
                            id: 'systolic',
                            type: 'number',
                            class: 'input-field',
                            value: state.form.systolic,
                            onChange: handleChange('systolic'),
                            placeholder: 'Systolic BP',
                            required: true
                        })
                    ),

                    // Diastolic BP
                    j.div({},
                        j.label({ for: 'diastolic', class: 'label-text' }, 'Diastolic (BP Bottom)'),
                        j.input({
                            id: 'diastolic',
                            type: 'number',
                            class: 'input-field',
                            value: state.form.diastolic,
                            onChange: handleChange('diastolic'),
                            placeholder: 'Diastolic BP',
                            required: true
                        })
                    ),
                    
                    // A1c
                    j.div({},
                        j.label({ for: 'a1c', class: 'label-text' }, 'A1c (Optional)'),
                        j.input({
                            id: 'a1c',
                            type: 'number',
                            step: '0.1',
                            class: 'input-field',
                            value: state.form.a1c,
                            onChange: handleChange('a1c'),
                            placeholder: 'e.g., 5.7',
                        })
                    ),

                    // Submit Button
                    j.div({ class: 'col-span-full flex-end' },
                        j.button({
                            type: 'submit',
                            class: 'btn-primary'
                        }, 'Save Log Entry')
                    )
                )
            );
        };

        /** Component for Alert Messages */
        const Alert = ({ type, text }) => {
            const styleClass = type === 'success' ? 'alert-success' : 'alert-error';
            return j.div({ class: `alert ${styleClass}` }, text);
        };

        /** Component for the Data Table View */
        const DataTableView = (logs) => {
            if (logs.length === 0) {
                return j.div({ class: 'empty-message' }, 'No health data logged yet.');
            }
            // Sort to show newest entries first in the table
            const sortedLogs = logs.slice().sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

            return j.div({ class: 'table-container' },
                j.table({ class: 'data-table' },
                    j.thead({},
                        j.tr({},
                            j.th({}, 'Date/Time'),
                            j.th({}, 'Weight (lbs)'),
                            j.th({}, 'BS (mg/dL)'),
                            j.th({}, 'Pulse'),
                            j.th({}, 'BP (S/D)'),
                            j.th({}, 'A1c')
                        )
                    ),
                    j.tbody({},
                        sortedLogs.map(log => j.tr({},
                            j.td({ class: 'text-medium' }, formatDateTime(log.datetime)),
                            j.td({ class: 'text-normal' }, log.weight ? `${log.weight} lbs` : 'N/A'),
                            j.td({ class: 'text-normal' }, log.bs ? `${log.bs}` : 'N/A'),
                            j.td({ class: 'text-normal' }, log.pulse ? `${log.pulse}` : 'N/A'),
                            j.td({ class: 'text-normal' }, log.bp || `${log.systolic}/${log.diastolic}` || 'N/A'),
                            j.td({ class: 'text-normal' }, log.a1c || 'N/A')
                        ))
                    )
                )
            );
        };

        /** Component for the Card View */
        const CardView = (logs) => {
            if (logs.length === 0) {
                return j.div({ class: 'empty-message' }, 'No health data logged yet.');
            }
            // Sort to show newest entries first in the cards
            const sortedLogs = logs.slice().sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

            return j.div({ class: 'card-grid' },
                sortedLogs.map(log => j.div({ class: 'data-card' },
                    j.p({ class: 'card-date' }, formatDateTime(log.datetime)),
                    j.div({ class: 'card-metric-grid' },
                        
                        // BP Card
                        j.div({ class: 'metric-item bg-blue' },
                            j.p({ class: 'metric-label' }, 'BP (S/D)'),
                            j.p({ class: 'metric-value text-blue' }, log.bp || `${log.systolic}/${log.diastolic}` || 'N/A')
                        ),
                        
                        // Weight Card
                        j.div({ class: 'metric-item bg-green' },
                            j.p({ class: 'metric-label' }, 'Weight'),
                            j.p({ class: 'metric-value text-green' }, log.weight ? `${log.weight} lbs` : 'N/A')
                        ),

                        // BS Card
                        j.div({ class: 'metric-item bg-red' },
                            j.p({ class: 'metric-label' }, 'Blood Sugar'),
                            j.p({ class: 'metric-value text-red' }, log.bs ? `${log.bs} mg/dL` : 'N/A')
                        ),

                        // Pulse Card
                        j.div({ class: 'metric-item bg-yellow' },
                            j.p({ class: 'metric-label' }, 'Pulse'),
                            j.p({ class: 'metric-value text-yellow' }, log.pulse ? `${log.pulse} BPM` : 'N/A')
                        ),

                        // A1c Card
                        log.a1c && j.div({ class: 'metric-item bg-purple col-span-2' },
                            j.p({ class: 'metric-label' }, 'A1c'),
                            j.p({ class: 'metric-value text-purple' }, log.a1c)
                        )
                    )
                ))
            );
        };

        /** Component for the Charts View */
        const ChartsView = (logs) => {
            if (logs.length < 2) {
                return j.div({ class: 'empty-message' }, 
                    'Need at least 2 entries to display a meaningful line chart.'
                );
            }

            // The canvas element where Chart.js will draw
            return j.div({ class: 'chart-container-wrapper' },
                j.div({ class: 'chart-container' },
                    j.canvas({ id: 'healthChart' })
                )
            );
        };


        /** Main App Component */
        const App = (state) => {
            const renderView = () => {
                if (state.loading) {
                    return j.div({ class: 'loading-message' }, 
                        'Loading data... (Ensure Deno server is running on port 8000)'
                    );
                }

                switch (state.currentView) {
                    case 'Table':
                        return DataTableView(state.logs);
                    case 'Cards':
                        return CardView(state.logs);
                    case 'Charts':
                    default:
                        // Defer chart rendering until after the canvas element is in the DOM
                        setTimeout(() => renderCharts(state.logs), 0); 
                        return ChartsView(state.logs);
                }
            };

            return j.div({ class: 'space-y-10' },
                // 1. Input Form
                HealthForm(state),

                // 2. Data Display Header
                j.div({ class: 'data-header' },
                    j.h2({}, 'Health Log History'),
                    
                    // View Selector Buttons
                    j.div({ class: 'view-tabs' },
                        VIEW_TYPES.map(view => j.button({
                            onClick: () => { 
                                state.currentView = view;
                                // Destroy chart when switching away from charts view
                                if (state.chartInstance && view !== 'Charts') {
                                    state.chartInstance.destroy();
                                    state.chartInstance = null;
                                }
                            },
                            class: state.currentView === view
                                ? 'view-tab-active'
                                : 'view-tab'
                        }, view))
                    )
                ),

                // 3. Dynamic View Content
                renderView()
            );
        };

        // --- Initialization ---

        // 1. Initial Data Fetch
        fetchLogs();

        // 2. Mount the Juris.js application
        mount('#app', App, state);

    </script>
</body>
</html>
