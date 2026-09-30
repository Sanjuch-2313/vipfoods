import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);
const currency = n => Number(n || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
const options = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } };
export default function DashboardCharts({ analytics }) {
  if (!analytics) return null;
  const months = analytics.months || [];
  const labels = months.map(m => m.label);
  return <section className="dashboard-analytics">
    <h2>Revenue & orders</h2>
    <p>Last six calendar months (India time). Collected revenue includes wallet and online payments, including COD advances. Cancelled and refunded orders are excluded from monetary totals.</p>
    <div className="dashboard-money-summary"><span>Total order value: <strong>{currency(analytics.orderValue)}</strong></span><span>Collected: <strong>{currency(analytics.collected)}</strong></span><span>Outstanding: <strong>{currency(analytics.outstanding)}</strong></span></div>
    <div className="dashboard-chart-grid">
      <article><h3>Monthly revenue</h3><div className="dashboard-chart"><Line options={{ ...options, plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${currency(c.parsed.y)}` } } } }} data={{ labels, datasets: [{ label: 'Collected (₹)', data: months.map(m => m.revenue), borderColor: '#16844a', backgroundColor: '#16844a', tension: .25 }, { label: 'Order value (₹)', data: months.map(m => m.orderValue), borderColor: '#3986db', backgroundColor: '#3986db', tension: .25 }] }} /></div></article>
      <article><h3>Monthly orders</h3><div className="dashboard-chart"><Bar options={{ ...options, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} data={{ labels, datasets: [{ label: 'Orders (all statuses)', data: months.map(m => m.orders), backgroundColor: '#16844a', borderRadius: 6 }] }} /></div></article>
      <article><h3>Order status · all time</h3><div className="dashboard-chart">{Object.keys(analytics.statuses || {}).length ? <Pie options={{ responsive: true, maintainAspectRatio: false }} data={{ labels: Object.keys(analytics.statuses), datasets: [{ data: Object.values(analytics.statuses), backgroundColor: ['#eebf42', '#458be3', '#9e70ce', '#3db5ca', '#16844a', '#e76b6b'] }] }} /> : <p>No orders yet.</p>}</div></article>
    </div>
  </section>;
}
