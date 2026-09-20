function SellerAnalytics({ analytics, loading, error, formatMoney }) {
  const summary = analytics?.summary || { totalRevenue: 0, totalOrders: 0, productsSold: 0 };
  const trend = analytics?.salesTrend || [];
  const topProducts = analytics?.topProducts || [];
  const lowStockProducts = analytics?.lowStockProducts || [];
  const recentSales = analytics?.recentSales || [];
  const maxRevenue = Math.max(...trend.map((item) => Number(item.revenue || 0)), 1);

  if (loading) return <section className="analytics-section dashboard-card" id="analytics"><div className="loading-box">Loading analytics...</div></section>;
  if (error) return <section className="analytics-section dashboard-card" id="analytics"><div className="empty-box"><h3>{error}</h3></div></section>;

  return (
    <section className="analytics-section" id="analytics">
      <div className="analytics-summary-grid">
        <article className="analytics-metric-card"><span className="summary-icon green">₹</span><small>Total Revenue</small><strong>{formatMoney(summary.totalRevenue)}</strong><em>Delivered and active sales</em></article>
        <article className="analytics-metric-card"><span className="summary-icon blue">▣</span><small>Total Orders</small><strong>{summary.totalOrders}</strong><em>Seller product orders</em></article>
        <article className="analytics-metric-card"><span className="summary-icon purple">◫</span><small>Products Sold</small><strong>{summary.productsSold}</strong><em>Units in completed sales</em></article>
      </div>

      <div className="analytics-grid">
        <article className="dashboard-card analytics-chart-card">
          <div className="card-heading"><div><span className="eyebrow">PERFORMANCE</span><h2>Sales Trend</h2></div><span className="period-chip">By day</span></div>
          {trend.length === 0 ? <div className="empty-box">No dated sales yet.</div> : <div className="sales-chart" aria-label="Daily sales trend">{trend.map((item) => <div className="sales-bar-item" key={item.date}><div className="sales-bar-value">{formatMoney(item.revenue)}</div><div className="sales-bar" style={{ height: `${Math.max(8, (Number(item.revenue) / maxRevenue) * 100)}%` }} /><small>{item.date}</small></div>)}</div>}
        </article>

        <article className="dashboard-card analytics-list-card"><div className="card-heading"><div><span className="eyebrow">BEST SELLERS</span><h2>Top Products</h2></div></div>{topProducts.length === 0 ? <div className="empty-box">No completed sales yet.</div> : <div className="analytics-list">{topProducts.slice(0, 5).map((product) => <div className="analytics-list-row" key={product.productId}><span><strong>{product.productName}</strong><small>{product.quantitySold} units sold</small></span><b>{formatMoney(product.revenue)}</b></div>)}</div>}</article>
      </div>

      <div className="analytics-grid lower-analytics-grid">
        <article className="dashboard-card analytics-list-card"><div className="card-heading"><div><span className="eyebrow">INVENTORY</span><h2>Low Stock</h2></div><span className="count-badge">{lowStockProducts.length}</span></div>{lowStockProducts.length === 0 ? <div className="empty-box">Stock levels look healthy.</div> : <div className="analytics-list">{lowStockProducts.map((product) => <div className="analytics-list-row" key={product.productId}><span><strong>{product.productName}</strong><small>Only {product.stockQuantity} left</small></span><span className="status-pill warning">Restock</span></div>)}</div>}</article>
        <article className="dashboard-card analytics-list-card"><div className="card-heading"><div><span className="eyebrow">ACTIVITY</span><h2>Recent Sales</h2></div></div>{recentSales.length === 0 ? <div className="empty-box">No recent sales yet.</div> : <div className="analytics-list">{recentSales.map((sale) => <div className="analytics-list-row" key={sale.orderId}><span><strong>Order #{sale.orderId}</strong><small>{sale.productName} · {sale.quantity} units · {sale.status}</small></span><b>{formatMoney(sale.totalPrice)}</b></div>)}</div>}</article>
      </div>
    </section>
  );
}

export default SellerAnalytics;