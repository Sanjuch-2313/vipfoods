import StatsCard from "../../components/StatsCard";

import {
DollarSign,
ShoppingBag,
Users,
Package,
} from "lucide-react";

import "./Dashboard.css";

export default function Dashboard(){

return(

<div>

<h1 className="page-title">
Dashboard
</h1>

<div className="stats-grid">

<StatsCard
title="Revenue"
value="₹0"
color="#2ecc71"
icon={<DollarSign/>}
/>

<StatsCard
title="Orders"
value="0"
color="#3498db"
icon={<ShoppingBag/>}
/>

<StatsCard
title="Customers"
value="0"
color="#9b59b6"
icon={<Users/>}
/>

<StatsCard
title="Products"
value="0"
color="#f39c12"
icon={<Package/>}
/>

</div>

<div className="dashboard-grid">

<div className="recent-orders">

<h2>
Recent Orders
</h2>

<p>No Orders Yet</p>

</div>

<div className="low-stock">

<h2>
Low Stock
</h2>

<p>No Low Stock Products</p>

</div>

</div>

</div>

)

}