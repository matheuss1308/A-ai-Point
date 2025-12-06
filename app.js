// ===============================
//  DASHBOARD AÇAÍ POINT - APP.JS
// ===============================

// Dados de vendas (exemplo realista)
const salesData = [
    { day: "01 Dez", value: 150 },
    { day: "02 Dez", value: 210 },
    { day: "03 Dez", value: 180 },
    { day: "04 Dez", value: 260 },
    { day: "05 Dez", value: 300 },
    { day: "06 Dez", value: 280 },
    { day: "07 Dez", value: 350 }
];

// Elementos
const totalSalesEl = document.getElementById("total-sales");
const dailyAverageEl = document.getElementById("daily-average");
const bestDayEl = document.getElementById("best-day");
const salesChartCanvas = document.getElementById("salesChart");

// Cálculos do Dashboard
function calculateDashboard() {
    const total = salesData.reduce((acc, item) => acc + item.value, 0);
    const average = Math.round(total / salesData.length);
    const bestDay = salesData.reduce((max, item) =>
        item.value > max.value ? item : max
    );

    totalSalesEl.textContent = `R$ ${total},00`;
    dailyAverageEl.textContent = `R$ ${average},00`;
    bestDayEl.textContent = `${bestDay.day} — R$ ${bestDay.value},00`;
}

// Gráfico
function renderChart() {
    new Chart(salesChartCanvas, {
        type: "line",
        data: {
            labels: salesData.map(d => d.day),
            datasets: [{
                label: "Vendas por dia",
                data: salesData.map(d => d.value),
                borderWidth: 3,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Inicialização
function initDashboard() {
    calculateDashboard();
    renderChart();
}

// Start
document.addEventListener("DOMContentLoaded", initDashboard);
