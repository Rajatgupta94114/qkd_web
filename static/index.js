// Toggle between Sign In and Sign Up panels
        function toggleAuth(panel) {
            const signInPanel = document.getElementById('signInPanel');
            const signUpPanel = document.getElementById('signUpPanel');
            if (panel === 'signIn') {
                signInPanel.style.display = 'flex';
                signUpPanel.style.display = 'none';
            } else {
                signInPanel.style.display = 'none';
                signUpPanel.style.display = 'flex';
            }
        }

        // Handle Splash Screen
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.getElementById('splash').style.display = 'none';
                document.getElementById('auth').style.display = 'flex';
            }, 5000);
        });

        // Handle Sign In
        document.getElementById('signInForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (document.getElementById('signInEmail').value && document.getElementById('signInPassword').value) {
                document.getElementById('auth').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                initApp();
            } else {
                alert('Please fill in all fields.');
            }
        });

        // Handle Sign Up
        document.getElementById('signUpForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('signUpPassword').value;
            const confirmPassword = document.getElementById('signUpConfirmPassword').value;
            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }
            if (document.getElementById('signUpFullName').value && document.getElementById('signUpEmail').value && password) {
                document.getElementById('auth').style.display = 'none';
                document.getElementById('subscription').style.display = 'flex';
            } else {
                alert('Please fill in all required fields.');
            }
        });

        // Handle Subscriptions
        document.getElementById('monthlySub').addEventListener('click', () => {
            alert('Subscribed to Monthly Plan!');
            document.getElementById('subscription').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            initApp();
        });

        document.getElementById('yearlySub').addEventListener('click', () => {
            alert('Subscribed to Yearly Plan!');
            document.getElementById('subscription').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            initApp();
        });

        // Global variables
        let isDarkMode = false;
        let isLeftPanelVisible = true;
        let runHistory = [];
        let keyLengthHistory = [];
        let charts = {};
        let popupChart = null;
        let currentChartId = null;

        // Clone chart configuration safely
        function cloneChartConfig(config) {
            return {
                type: config.type,
                data: JSON.parse(JSON.stringify(config.data || {})),
                options: JSON.parse(JSON.stringify(config.options || {}))
            };
        }

        // Initialize charts
        function initializeCharts() {
            if (typeof Chart === 'undefined') {
                console.error('Chart.js failed to load.');
                alert('Error: Chart.js library failed to load. Please check your internet connection or CDN.');
                return;
            }

            const qberCtx = document.getElementById('qberChart')?.getContext('2d');
            if (qberCtx) {
                charts.qberChart = new Chart(qberCtx, {
                    type: 'scatter',
                    data: {
                        datasets: [
                            {
                                label: 'Eve OFF',
                                data: [],
                                borderColor: '#1f77b4',
                                backgroundColor: '#1f77b4',
                                pointStyle: 'circle',
                                pointRadius: 6,
                                showLine: true
                            },
                            {
                                label: 'Eve ON',
                                data: [],
                                borderColor: '#d62728',
                                backgroundColor: '#d62728',
                                pointStyle: 'rect',
                                pointRadius: 6,
                                showLine: true
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: {
                                bottom: 30
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    font: { size: 10 }
                                }
                            }
                        },
                        scales: {
                            x: {
                                type: 'linear',
                                title: {
                                    display: true,
                                    text: 'Noise (%)',
                                    font: { size: 12 }
                                },
                                ticks: {
                                    font: { size: 10 }
                                },
                                beginAtZero: true
                            },
                            y: {
                                type: 'linear',
                                title: {
                                    display: true,
                                    text: 'QBER (%)',
                                    font: { size: 12 }
                                },
                                ticks: {
                                    font: { size: 10 }
                                },
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            const keyLengthCtx = document.getElementById('keyLengthChart')?.getContext('2d');
            if (keyLengthCtx) {
                charts.keyLengthChart = new Chart(keyLengthCtx, {
                    type: 'scatter',
                    data: {
                        datasets: [
                            {
                                label: 'Eve OFF',
                                data: [],
                                borderColor: '#1f77b4',
                                backgroundColor: '#1f77b4',
                                pointStyle: 'circle',
                                pointRadius: 6,
                                showLine: true
                            },
                            {
                                label: 'Eve ON',
                                data: [],
                                borderColor: '#d62728',
                                backgroundColor: '#d62728',
                                pointStyle: 'rect',
                                pointRadius: 6,
                                showLine: true
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'KEY LENGTH VS NOISE'
                            },
                            legend: { position: 'top' }
                        },
                        scales: {
                            x: {
                                type: 'linear',
                                title: {
                                    display: true,
                                    text: 'Noise (%)'
                                },
                                beginAtZero: true
                            },
                            y: {
                                type: 'linear',
                                title: {
                                    display: true,
                                    text: 'Key Length'
                                },
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            const keyTrendCtx = document.getElementById('keyTrendChart')?.getContext('2d');
            if (keyTrendCtx) {
                charts.keyTrendChart = new Chart(keyTrendCtx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Key Length',
                            data: [],
                            borderColor: '#6B7C93',
                            backgroundColor: '#6B7C93',
                            pointRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'KEY LENGTH (TREND)'
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'RUN #'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'KEY LENGTH'
                                }
                            }
                        }
                    }
                });
            }

            const bitBarCtx = document.getElementById('bitBarChart')?.getContext('2d');
            if (bitBarCtx) {
                charts.bitBarChart = new Chart(bitBarCtx, {
                    type: 'bar',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            backgroundColor: [],
                            barThickness: 1,
                            categoryPercentage: 1.0,
                            barPercentage: 1.0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Bit Agreement (Blue = match, Gray = mismatch)',
                                font: { size: 12 }
                            },
                            legend: { display: false }
                        },
                        scales: {
                            x: { display: false },
                            y: { display: false, min: 0, max: 1, grid: { display: false } }
                        },
                        elements: {
                            bar: { borderWidth: 0 }
                        }
                    }
                });
            }

            const bitCumulativeCtx = document.getElementById('bitCumulativeChart')?.getContext('2d');
            if (bitCumulativeCtx) {
                charts.bitCumulativeChart = new Chart(bitCumulativeCtx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Cumulative Agreement',
                            data: [],
                            borderColor: '#1f77b4',
                            backgroundColor: '#1f77b4',
                            pointRadius: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            title: { display: false }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Sifted bit index',
                                    font: { size: 10 }
                                },
                                ticks: { font: { size: 8 } }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Cumulative Agreement',
                                    font: { size: 10 }
                                },
                                min: 0,
                                max: 150,
                                ticks: { font: { size: 8 } }
                            }
                        }
                    }
                });
            }

            const leakageCtx = document.getElementById('leakageChart')?.getContext('2d');
            if (leakageCtx) {
                charts.leakageChart = new Chart(leakageCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Cascade', 'QBER', 'PA', 'Margin'],
                        datasets: [{
                            data: [0, 0, 0, 0],
                            backgroundColor: ['#E8B8B8', '#6B7C93', '#B8CDE8', '#F5E6B8'],
                            borderColor: '#333333',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'LEAKAGE BREAKDOWN'
                            },
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }

            console.log('Initialized charts:', Object.keys(charts));
        }

        function generateBitAgreementData(qber = 20.0) {
            const sampleSize = 300;
            const pMismatch = qber / 100.0;
            const bitMatches = [];
            const cumulative = [];
            const xPositions = [];
            
            for (let i = 0; i < sampleSize; i++) {
                bitMatches.push(Math.random() > pMismatch ? 1 : 0);
                xPositions.push(i);
            }
            
            let sum = 0;
            for (let i = 0; i < sampleSize; i++) {
                sum += bitMatches[i];
                cumulative.push((sum / (i + 1)) * 100);
            }
            
            return { bitMatches, cumulative, xPositions };
        }

        function updateSliderValue(type) {
            const slider = document.getElementById(type + 'Slider');
            const valueDisplay = document.getElementById(type + 'Value');
            const value = parseInt(slider.value);
            
            switch(type) {
                case 'noise':
                    valueDisplay.textContent = value + '%';
                    break;
                case 'cascade':
                    valueDisplay.textContent = value + ' bits';
                    break;
                case 'qberLeak':
                    valueDisplay.textContent = (value / 100).toFixed(2);
                    break;
                case 'margin':
                    valueDisplay.textContent = value + ' bits';
                    break;
            }

            const popupSlider = document.getElementById('popup' + type.charAt(0).toUpperCase() + type.slice(1) + 'Slider');
            const popupValueDisplay = document.getElementById('popup' + type.charAt(0).toUpperCase() + type.slice(1) + 'Value');
            if (popupSlider && popupValueDisplay) {
                popupSlider.value = slider.value;
                popupValueDisplay.textContent = valueDisplay.textContent;
            }
        }

        function applyPreset(preset) {
            const noiseSlider = document.getElementById('noiseSlider');
            const cascadeSlider = document.getElementById('cascadeSlider');
            const qberLeakSlider = document.getElementById('qberLeakSlider');
            const marginSlider = document.getElementById('marginSlider');
            const eveCheckbox = document.getElementById('eveCheckbox');

            switch(preset) {
                case 'clean':
                    noiseSlider.value = 0;
                    cascadeSlider.value = 0;
                    qberLeakSlider.value = 0;
                    marginSlider.value = 0;
                    eveCheckbox.checked = false;
                    break;
                case 'noisy':
                    noiseSlider.value = 5;
                    cascadeSlider.value = 0;
                    qberLeakSlider.value = 0;
                    marginSlider.value = 0;
                    eveCheckbox.checked = false;
                    break;
                case 'eve':
                    noiseSlider.value = 8;
                    cascadeSlider.value = 120;
                    qberLeakSlider.value = 60;
                    marginSlider.value = 32;
                    eveCheckbox.checked = !eveCheckbox.checked;
                    break;
            }
            
            updateSliderValue('noise');
            updateSliderValue('cascade');
            updateSliderValue('qberLeak');
            updateSliderValue('margin');

            syncPopupControls();
        }

        function syncPopupControls() {
            const popupLeftPanel = document.getElementById('popupLeftPanel');
            if (!popupLeftPanel) return;

            const qubitsInput = document.getElementById('qubits');
            const noiseSlider = document.getElementById('noiseSlider');
            const cascadeSlider = document.getElementById('cascadeSlider');
            const qberLeakSlider = document.getElementById('qberLeakSlider');
            const marginSlider = document.getElementById('marginSlider');
            const eveCheckbox = document.getElementById('eveCheckbox');

            const popupQubitsInput = document.getElementById('popupQubits');
            const popupNoiseSlider = document.getElementById('popupNoiseSlider');
            const popupCascadeSlider = document.getElementById('popupCascadeSlider');
            const popupQberLeakSlider = document.getElementById('popupQberLeakSlider');
            const popupMarginSlider = document.getElementById('popupMarginSlider');
            const popupEveCheckbox = document.getElementById('popupEveCheckbox');

            if (popupQubitsInput) popupQubitsInput.value = qubitsInput.value;
            if (popupNoiseSlider) popupNoiseSlider.value = noiseSlider.value;
            if (popupCascadeSlider) popupCascadeSlider.value = cascadeSlider.value;
            if (popupQberLeakSlider) popupQberLeakSlider.value = qberLeakSlider.value;
            if (popupMarginSlider) popupMarginSlider.value = marginSlider.value;
            if (popupEveCheckbox) popupEveCheckbox.checked = eveCheckbox.checked;

            updateSliderValue('noise');
            updateSliderValue('cascade');
            updateSliderValue('qberLeak');
            updateSliderValue('margin');
        }

        function toggleDarkMode() {
            isDarkMode = !isDarkMode;
            const body = document.body;
            const darkModeBtn = document.getElementById('darkModeBtn');
            const popupDarkModeBtn = document.getElementById('popupDarkModeBtn');
            
            if (isDarkMode) {
                body.classList.add('dark-mode');
                darkModeBtn.textContent = 'LIGHT MODE';
                if (popupDarkModeBtn) popupDarkModeBtn.textContent = 'LIGHT MODE';
                updateChartsTheme(true);
            } else {
                body.classList.remove('dark-mode');
                darkModeBtn.textContent = 'DARK MODE';
                if (popupDarkModeBtn) popupDarkModeBtn.textContent = 'DARK MODE';
                updateChartsTheme(false);
            }
        }

        function updateChartsTheme(dark) {
            const textColor = dark ? '#E0E0E0' : '#333333';
            const gridColor = dark ? '#3A3A3A' : '#E0E0E0';
            
            Object.values(charts).forEach(chart => {
                if (chart.options) {
                    chart.options.color = textColor;
                    if (chart.options.scales) {
                        Object.keys(chart.options.scales).forEach(scale => {
                            if (chart.options.scales[scale].grid) {
                                chart.options.scales[scale].grid.color = gridColor;
                            }
                            if (chart.options.scales[scale].ticks) {
                                chart.options.scales[scale].ticks.color = textColor;
                            }
                        });
                    }
                    chart.update();
                }
            });

            if (popupChart && popupChart.options) {
                if (currentChartId === 'bitCharts') {
                    ['bitBarChart', 'bitCumulativeChart'].forEach(chartKey => {
                        if (popupChart[chartKey].options) {
                            popupChart[chartKey].options.color = textColor;
                            if (popupChart[chartKey].options.scales) {
                                Object.keys(popupChart[chartKey].options.scales).forEach(scale => {
                                    if (popupChart[chartKey].options.scales[scale].grid) {
                                        popupChart[chartKey].options.scales[scale].grid.color = gridColor;
                                    }
                                    if (popupChart[chartKey].options.scales[scale].ticks) {
                                        popupChart[chartKey].options.scales[scale].ticks.color = textColor;
                                    }
                                });
                            }
                            popupChart[chartKey].update();
                        }
                    });
                } else {
                    popupChart.options.color = textColor;
                    if (popupChart.options.scales) {
                        Object.keys(popupChart.options.scales).forEach(scale => {
                            if (popupChart.options.scales[scale].grid) {
                                popupChart.options.scales[scale].grid.color = gridColor;
                            }
                            if (popupChart.options.scales[scale].ticks) {
                                popupChart.options.scales[scale].ticks.color = textColor;
                            }
                        });
                    }
                    popupChart.update();
                }
            }
        }

        function openPopup(chartId) {
            const validChartIds = ['qberChart', 'keyLengthChart', 'keyTrendChart', 'bitCharts', 'leakageChart'];
            if (!validChartIds.includes(chartId)) {
                console.error(`Invalid chartId: ${chartId}`);
                alert(`Error: Invalid chart ID ${chartId}. Please select a valid chart.`);
                return;
            }
        
            const popup = document.getElementById('chartPopup');
            const popupCanvasContainer = document.getElementById('popupCanvasContainer');
        
            // Clean up existing popup chart
            if (popupChart) {
                if (currentChartId === 'bitCharts') {
                    if (popupChart.bitBarChart) popupChart.bitBarChart.destroy();
                    if (popupChart.bitCumulativeChart) popupChart.bitCumulativeChart.destroy();
                } else if (popupChart) {
                    popupChart.destroy();
                }
                popupChart = null;
            }
        
            currentChartId = chartId;
        
            // Initialize popup chart canvas
            popupCanvasContainer.innerHTML = ''; // Clear previous canvas
            if (chartId === 'bitCharts') {
                popupCanvasContainer.style.display = 'flex';
                popupCanvasContainer.style.flexDirection = 'column';
                popupCanvasContainer.innerHTML = `
                    <div style="height: 20%;">
                        <canvas id="popupBitBarChart"></canvas>
                    </div>
                    <div style="flex: 1;">
                        <canvas id="popupBitCumulativeChart"></canvas>
                    </div>
                `;
                const bitBarCtx = document.getElementById('popupBitBarChart')?.getContext('2d');
                const bitCumulativeCtx = document.getElementById('popupBitCumulativeChart')?.getContext('2d');
        
                if (!bitBarCtx || !bitCumulativeCtx) {
                    console.error('Popup canvas contexts not found for bitCharts');
                    alert('Error: Failed to initialize popup chart canvases.');
                    return;
                }
        
                const bitBarConfig = cloneChartConfig(charts.bitBarChart.config);
                const bitCumulativeConfig = cloneChartConfig(charts.bitCumulativeChart.config);
        
                if (!bitBarConfig.type || !bitCumulativeConfig.type) {
                    console.error('Chart type is undefined:', { bitBarConfig, bitCumulativeConfig });
                    alert('Error: Chart type is undefined for bitCharts. Please check chart configurations.');
                    return;
                }
        
                popupChart = {
                    bitBarChart: new Chart(bitBarCtx, bitBarConfig),
                    bitCumulativeChart: new Chart(bitCumulativeCtx, bitCumulativeConfig)
                };
        
                popupChart.bitBarChart.data = JSON.parse(JSON.stringify(charts.bitBarChart.data));
                popupChart.bitCumulativeChart.data = JSON.parse(JSON.stringify(charts.bitCumulativeChart.data));
                popupChart.bitBarChart.update();
                popupChart.bitCumulativeChart.update();
            } else {
                popupCanvasContainer.style.display = 'block';
                popupCanvasContainer.innerHTML = '<canvas id="popupChartCanvas"></canvas>';
                const newCtx = document.getElementById('popupChartCanvas')?.getContext('2d');
        
                if (!newCtx) {
                    console.error('Popup canvas context not found for:', chartId);
                    alert('Error: Failed to initialize popup chart canvas.');
                    return;
                }
        
                const chartConfig = cloneChartConfig(charts[chartId].config);
        
                if (!chartConfig.type) {
                    console.error(`Chart type is undefined for ${chartId}`);
                    alert(`Error: Chart type is undefined for ${chartId}. Please check chart configurations.`);
                    return;
                }
        
                popupChart = new Chart(newCtx, chartConfig);
                popupChart.data = JSON.parse(JSON.stringify(charts[chartId].data));
                popupChart.update();
            }
        
            // Apply dark mode to popup chart if active
            if (isDarkMode) {
                updateChartsTheme(true);
            }
        
            popup.style.display = 'block';
        }

        function closePopup() {
            const popup = document.getElementById('chartPopup');
            if (popupChart) {
                if (currentChartId === 'bitCharts') {
                    if (popupChart.bitBarChart) popupChart.bitBarChart.destroy();
                    if (popupChart.bitCumulativeChart) popupChart.bitCumulativeChart.destroy();
                } else if (popupChart) {
                    popupChart.destroy();
                }
                popupChart = null;
            }
            currentChartId = null;
            const popupCanvasContainer = document.getElementById('popupCanvasContainer');
            if (popupCanvasContainer) {
                popupCanvasContainer.innerHTML = ''; // Clear canvas container
            }
            popup.style.display = 'none';
        }

        function zoomChart(factor) {
            if (!popupChart) return;
            if (currentChartId === 'bitCharts') {
                ['bitBarChart', 'bitCumulativeChart'].forEach(chart => {
                    if (popupChart[chart].options.scales.x) {
                        const xScale = popupChart[chart].options.scales.x;
                        xScale.min = xScale.min ? xScale.min * factor : popupChart[chart].scales.x.min * factor;
                        xScale.max = xScale.max ? xScale.max * factor : popupChart[chart].scales.x.max * factor;
                    }
                    if (popupChart[chart].options.scales.y) {
                        const yScale = popupChart[chart].options.scales.y;
                        yScale.min = yScale.min ? yScale.min * factor : popupChart[chart].scales.y.min * factor;
                        yScale.max = yScale.max ? xScale.max * factor : popupChart[chart].scales.y.max * factor;
                    }
                    popupChart[chart].update();
                });
            } else {
                if (popupChart.options.scales.x) {
                    const xScale = popupChart.options.scales.x;
                    xScale.min = xScale.min ? xScale.min * factor : popupChart.scales.x.min * factor;
                    xScale.max = xScale.max ? xScale.max * factor : popupChart.scales.x.max * factor;
                }
                if (popupChart.options.scales.y) {
                    const yScale = popupChart.options.scales.y;
                    yScale.min = yScale.min ? yScale.min * factor : popupChart.scales.y.min * factor;
                    yScale.max = yScale.max ? xScale.max * factor : popupChart.scales.y.max * factor;
                }
                popupChart.update();
            }
        }

        function panChart(offset) {
            if (!popupChart) return;
            if (currentChartId === 'bitCharts') {
                ['bitBarChart', 'bitCumulativeChart'].forEach(chart => {
                    if (popupChart[chart].options.scales.x) {
                        const xScale = popupChart[chart].options.scales.x;
                        const range = (xScale.max || popupChart[chart].scales.x.max) - (xScale.min || popupChart[chart].scales.x.min);
                        xScale.min = (xScale.min || popupChart[chart].scales.x.min) + offset;
                        xScale.max = (xScale.max || popupChart[chart].scales.x.max) + offset;
                        popupChart[chart].update();
                    }
                });
            } else {
                if (popupChart.options.scales.x) {
                    const xScale = popupChart.options.scales.x;
                    const range = (xScale.max || popupChart.scales.x.max) - (xScale.min || popupChart.scales.x.min);
                    xScale.min = (xScale.min || popupChart.scales.x.min) + offset;
                    xScale.max = (xScale.max || popupChart.scales.x.max) + offset;
                    popupChart.update();
                }
            }
        }

        function resetChart() {
            if (!popupChart) return;
            if (currentChartId === 'bitCharts') {
                ['bitBarChart', 'bitCumulativeChart'].forEach(chart => {
                    popupChart[chart].options.scales.x.min = undefined;
                    popupChart[chart].options.scales.x.max = undefined;
                    popupChart[chart].options.scales.y.min = undefined;
                    popupChart[chart].options.scales.y.max = undefined;
                    popupChart[chart].update();
                });
            } else {
                popupChart.options.scales.x.min = undefined;
                popupChart.options.scales.x.max = undefined;
                popupChart.options.scales.y.min = undefined;
                popupChart.options.scales.y.max = undefined;
                popupChart.update();
            }
        }

        function downloadChart() {
            if (!popupChart) {
                alert('No chart available to download.');
                return;
            }

            let chartToDownload;
            if (currentChartId === 'bitCharts') {
                // Download the first chart (bitBarChart) as a representative
                chartToDownload = popupChart.bitBarChart;
            } else {
                chartToDownload = popupChart;
            }

            const link = document.createElement('a');
            link.download = `chart_${currentChartId}_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
            link.href = chartToDownload.toBase64Image();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('Chart downloaded as PNG.');
        }

        function updateBitAgreementChart(bitMatches, qber) {
            let agreementData;
            if (!bitMatches || bitMatches.length === 0) {
                agreementData = generateBitAgreementData(qber || 20.0);
            } else {
                const sampleSize = bitMatches.length;
                const xPositions = Array.from({length: sampleSize}, (_, i) => i);
                let sum = 0;
                const cumulative = bitMatches.map((m, i) => {
                    sum += m;
                    return (sum / (i + 1)) * 100;
                });
                agreementData = { bitMatches, cumulative, xPositions };
            }

            const colors = agreementData.bitMatches.map(m => m ? '#1f77b4' : '#a9a9a9');

            const barChart = charts.bitBarChart;
            barChart.data.labels = agreementData.xPositions;
            barChart.data.datasets[0].data = agreementData.bitMatches;
            barChart.data.datasets[0].backgroundColor = colors;
            barChart.update();

            const lineChart = charts.bitCumulativeChart;
            lineChart.data.labels = agreementData.xPositions;
            lineChart.data.datasets[0].data = agreementData.cumulative;
            lineChart.update();

            if (popupChart && currentChartId === 'bitCharts') {
                popupChart.bitBarChart.data.labels = agreementData.xPositions;
                popupChart.bitBarChart.data.datasets[0].data = agreementData.bitMatches;
                popupChart.bitBarChart.data.datasets[0].backgroundColor = colors;
                popupChart.bitBarChart.update();

                popupChart.bitCumulativeChart.data.labels = agreementData.xPositions;
                popupChart.bitCumulativeChart.data.datasets[0].data = agreementData.cumulative;
                popupChart.bitCumulativeChart.update();
            }
        }

        async function runQKD() {
            const runBtn = document.querySelector('.action-btn.run');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const console = document.getElementById('console');
            
            runBtn.disabled = true;
            runBtn.style.opacity = '0.5';
            loadingSpinner.style.display = 'block';
            
            try {
                const params = {
                    n_bits: parseInt(document.getElementById('qubits').value),
                    noise_prob: parseInt(document.getElementById('noiseSlider').value) / 100.0,
                    eve: document.getElementById('eveCheckbox').checked,
                    cascade_leak: parseInt(document.getElementById('cascadeSlider').value),
                    qber_leak: parseInt(document.getElementById('qberLeakSlider').value) / 100.0,
                    security_margin: parseInt(document.getElementById('marginSlider').value),
                    qber_threshold: 0.5
                };

                if (params.n_bits < 100 || params.noise_prob < 0 || params.cascade_leak < 0 || 
                    params.qber_leak < 0 || params.security_margin < 0) {
                    throw new Error('Invalid simulation parameters');
                }

                console.textContent += `\nRunning QKD simulation with ${params.n_bits} qubits...\n`;
                console.scrollTop = console.scrollHeight;

                const response = await fetch('/api/run_qkd', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(params)
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                const data = await response.json();

                if (data.log && data.log.toLowerCase().includes('abort')) {
                    alert(`QKD Aborted: ${data.log}`);
                    console.textContent += data.log + '\n';
                    console.scrollTop = console.scrollHeight;
                    return;
                }

                console.textContent += data.log + '\n';
                console.textContent += `Final Key (Hex): ${data.hex_key}\n`;
                console.textContent += `Final Key (Binary, First 20 Bits): ${data.binary_key}\n`;
                console.scrollTop = console.scrollHeight;

                updateMetrics(data);
                updateBitAgreementChart(data.bitMatches, data.qber * 100);
                addToRunHistory(data, params);
                updateAllCharts();

                console.textContent += 'SIMULATION RUN COMPLETE. DATA LOGGED AUTOMATICALLY.\n';
                console.scrollTop = console.scrollHeight;

            } catch (error) {
                console.textContent += `ERROR: ${error.message.toUpperCase()}\n`;
                console.scrollTop = console.scrollHeight;
                alert(`Simulation failed: ${error.message}`);
            } finally {
                runBtn.disabled = false;
                runBtn.style.opacity = '1';
                loadingSpinner.style.display = 'none';
            }
        }

        function updateMetrics(data) {
            const qberProgress = document.getElementById('qberProgress');
            const qberValue = Math.max(0, Math.min(100, Math.round(data.qber * 100)));
            qberProgress.style.width = qberValue + '%';
            qberProgress.textContent = qberValue + '%';

            document.getElementById('keyLength').textContent = data.key_length || 0;
            document.getElementById('totalLeak').textContent = data.total_leak || 0;
        }

        function addToRunHistory(data, params) {
            const timestamp = new Date();
            const runEntry = {
                timestamp: timestamp,
                qubits: params.n_bits,
                noise_percent: params.noise_prob * 100,
                eve_enabled: params.eve,
                qber_percent: data.qber * 100,
                key_length: data.key_length,
                cascade_leak: data.cascade_leak || 0,
                qber_leak: data.qber_leak || 0,
                pa_leak: data.pa_leak || 0,
                margin: params.security_margin,
                total_leak: data.total_leak || 0,
                hex_key: data.hex_key || 'N/A',
                binary_key: data.binary_key || 'N/A'
            };

            runHistory.push(runEntry);
            keyLengthHistory.push(data.key_length);

            const tbody = document.getElementById('historyTableBody');
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${timestamp.toLocaleTimeString()}</td>
                <td>${params.n_bits}</td>
                <td>${(params.noise_prob * 100).toFixed(1)}</td>
                <td>${params.eve ? 'ON' : 'OFF'}</td>
                <td>${(data.qber * 100).toFixed(2)}</td>
                <td>${data.key_length}</td>
            `;

            tbody.scrollTop = tbody.scrollHeight;
        }

        function updateAllCharts() {
            updateQberChart();
            updateKeyLengthChart();
            updateKeyTrendChart();
            updateLeakageChart();
        }

        function updateQberChart() {
            if (runHistory.length === 0) return;

            const eveOffData = runHistory.filter(entry => !entry.eve_enabled)
                .sort((a, b) => a.noise_percent - b.noise_percent);
            const eveOnData = runHistory.filter(entry => entry.eve_enabled)
                .sort((a, b) => a.noise_percent - b.noise_percent);

            const chart = charts.qberChart;
            
            if (eveOffData.length > 0) {
                chart.data.datasets[0].data = eveOffData.map(entry => ({
                    x: entry.noise_percent,
                    y: entry.qber_percent
                }));
            }

            if (eveOnData.length > 0) {
                chart.data.datasets[1].data = eveOnData.map(entry => ({
                    x: entry.noise_percent,
                    y: entry.qber_percent
                }));
            }

            chart.update();

            if (popupChart && currentChartId === 'qberChart') {
                popupChart.data.datasets[0].data = chart.data.datasets[0].data;
                popupChart.data.datasets[1].data = chart.data.datasets[1].data;
                popupChart.update();
            }
        }

        function updateKeyLengthChart() {
            if (runHistory.length === 0) return;

            const eveOffData = runHistory.filter(entry => !entry.eve_enabled)
                .sort((a, b) => a.noise_percent - b.noise_percent);
            const eveOnData = runHistory.filter(entry => entry.eve_enabled)
                .sort((a, b) => a.noise_percent - b.noise_percent);

            const chart = charts.keyLengthChart;
            
            if (eveOffData.length > 0) {
                chart.data.datasets[0].data = eveOffData.map(entry => ({
                    x: entry.noise_percent,
                    y: entry.key_length
                }));
            }

            if (eveOnData.length > 0) {
                chart.data.datasets[1].data = eveOnData.map(entry => ({
                    x: entry.noise_percent,
                    y: entry.key_length
                }));
            }

            chart.update();

            if (popupChart && currentChartId === 'keyLengthChart') {
                popupChart.data.datasets[0].data = chart.data.datasets[0].data;
                popupChart.data.datasets[1].data = chart.data.datasets[1].data;
                popupChart.update();
            }
        }

        function updateKeyTrendChart() {
            const chart = charts.keyTrendChart;
            chart.data.labels = keyLengthHistory.map((_, index) => index + 1);
            chart.data.datasets[0].data = keyLengthHistory;
            chart.update();

            if (popupChart && currentChartId === 'keyTrendChart') {
                popupChart.data.labels = chart.data.labels;
                popupChart.data.datasets[0].data = chart.data.datasets[0].data;
                popupChart.update();
            }
        }

        function updateLeakageChart() {
            if (runHistory.length === 0) return;

            const lastRun = runHistory[runHistory.length - 1];
            const chart = charts.leakageChart;
            
            chart.data.datasets[0].data = [
                lastRun.cascade_leak,
                lastRun.qber_leak,
                lastRun.pa_leak,
                lastRun.margin
            ];
            
            chart.update();

            if (popupChart && currentChartId === 'leakageChart') {
                popupChart.data.datasets[0].data = chart.data.datasets[0].data;
                popupChart.update();
            }
        }

        function resetSimulation() {
            document.getElementById('console').textContent = 'CLICK \'RUN QKD\' TO START SIMULATION...\n';
            
            runHistory = [];
            keyLengthHistory = [];
            document.getElementById('historyTableBody').innerHTML = '';
            
            document.getElementById('qberProgress').style.width = '0%';
            document.getElementById('qberProgress').textContent = '0%';
            document.getElementById('keyLength').textContent = '0';
            document.getElementById('totalLeak').textContent = '0';
            
            document.getElementById('qubits').value = 2048;
            document.getElementById('noiseSlider').value = 0;
            document.getElementById('cascadeSlider').value = 0;
            document.getElementById('qberLeakSlider').value = 0;
            document.getElementById('marginSlider').value = 0;
            document.getElementById('eveCheckbox').checked = false;
            
            updateSliderValue('noise');
            updateSliderValue('cascade');
            updateSliderValue('qberLeak');
            updateSliderValue('margin');
            
            syncPopupControls();
            
            Object.values(charts).forEach(chart => chart.destroy());
            charts = {};
            initializeCharts();
            updateBitAgreementChart([], 20.0);
            
            if (popupChart && currentChartId) {
                if (currentChartId === 'bitCharts') {
                    if (popupChart.bitBarChart) popupChart.bitBarChart.destroy();
                    if (popupChart.bitCumulativeChart) popupChart.bitCumulativeChart.destroy();
                    const popupCanvasContainer = document.getElementById('popupCanvasContainer');
                    if (popupCanvasContainer) {
                        popupCanvasContainer.innerHTML = `
                            <div style="height: 20%;">
                                <canvas id="popupBitBarChart"></canvas>
                            </div>
                            <div style="flex: 1;">
                                <canvas id="popupBitCumulativeChart"></canvas>
                            </div>
                        `;
                        const bitBarCtx = document.getElementById('popupBitBarChart')?.getContext('2d');
                        const bitCumulativeCtx = document.getElementById('popupBitCumulativeChart')?.getContext('2d');
                        if (bitBarCtx && bitCumulativeCtx) {
                            popupChart = {
                                bitBarChart: new Chart(bitBarCtx, cloneChartConfig(charts.bitBarChart.config)),
                                bitCumulativeChart: new Chart(bitCumulativeCtx, cloneChartConfig(charts.bitCumulativeChart.config))
                            };
                            popupChart.bitBarChart.data = JSON.parse(JSON.stringify(charts.bitBarChart.data));
                            popupChart.bitCumulativeChart.data = JSON.parse(JSON.stringify(charts.bitCumulativeChart.data));
                            popupChart.bitBarChart.update();
                            popupChart.bitCumulativeChart.update();
                        }
                    }
                } else if (popupChart) {
                    popupChart.destroy();
                    const popupCanvasContainer = document.getElementById('popupCanvasContainer');
                    if (popupCanvasContainer) {
                        popupCanvasContainer.innerHTML = '<canvas id="popupChartCanvas"></canvas>';
                        const newCtx = document.getElementById('popupChartCanvas')?.getContext('2d');
                        if (newCtx && charts[currentChartId]) {
                            popupChart = new Chart(newCtx, cloneChartConfig(charts[currentChartId].config));
                            popupChart.data = JSON.parse(JSON.stringify(charts[currentChartId].data));
                            popupChart.update();
                        }
                    }
                }
            }
        }

        function exportData() {
            if (runHistory.length === 0) {
                alert('No simulation data to export.');
                return;
            }

            const csvContent = [
                'Timestamp,Qubits,Noise %,Eve,QBER %,Key Length,Cascade Leak,QBER Leak,PA Leak,Margin,Total Leak,Hex Key,Binary Key',
                ...runHistory.map(entry => [
                    entry.timestamp.toISOString(),
                    entry.qubits,
                    entry.noise_percent,
                    entry.eve_enabled ? 'ON' : 'OFF',
                    entry.qber_percent.toFixed(2),
                    entry.key_length,
                    entry.cascade_leak,
                    entry.qber_leak,
                    entry.pa_leak,
                    entry.margin,
                    entry.total_leak,
                    entry.hex_key,
                    entry.binary_key
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `qkd_simulation_data_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('Data exported as CSV.');
        }

        function generateReport() {
            if (runHistory.length === 0) {
                alert('No simulation data to generate a report.');
                return;
            }

            const reportContent = `
                QKD Simulation Report - Generated at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                ======================================
                Number of Runs: ${runHistory.length}

                Summary Statistics:
                - Average QBER: ${runHistory.reduce((sum, entry) => sum + entry.qber_percent, 0) / runHistory.length.toFixed(2)}%
                - Average Key Length: ${runHistory.reduce((sum, entry) => sum + entry.key_length, 0) / runHistory.length.toFixed(0)}
                - Average Total Leak: ${runHistory.reduce((sum, entry) => sum + entry.total_leak, 0) / runHistory.length.toFixed(2)} bits

                Run History:
                ${runHistory.map(entry => `
                    - Time: ${entry.timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      Qubits: ${entry.qubits}, Noise: ${entry.noise_percent}%, Eve: ${entry.eve_enabled ? 'ON' : 'OFF'}
                      QBER: ${entry.qber_percent.toFixed(2)}%, Key Length: ${entry.key_length}
                      Leaks: Cascade(${entry.cascade_leak}), QBER(${entry.qber_leak}), PA(${entry.pa_leak}), Margin(${entry.margin})
                      Total Leak: ${entry.total_leak} bits
                      Hex Key: ${entry.hex_key}
                      Binary Key (First 20 Bits): ${entry.binary_key}`.trim()).join('\n\n')}
            `;

            const blob = new Blob([reportContent], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `qkd_simulation_report_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('Report generated and downloaded.');
        }

        function initApp() {
            initializeCharts();
            updateSliderValue('noise');
            updateSliderValue('cascade');
            updateSliderValue('qberLeak');
            updateSliderValue('margin');
            updateBitAgreementChart([], 20.0); // Initialize with default QBER
        }

        // Initialize the app on page load
        window.addEventListener('load', initApp);