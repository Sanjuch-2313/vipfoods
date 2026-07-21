import { useState, useEffect } from "react";
import { getCustomers, deleteCustomer } from "../../services/customerService.js";
import "../../styles/Customers.css";
import { Link } from "react-router-dom";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCustomers();
  }, [search, page]);

  const fetchCustomers = async () => {
    const data = await getCustomers({ search, page });
    setCustomers(data.customers);
  };

  const fetchCustomers = async () => {
  try {
    const data = await getCustomers({ search, page });

    console.log(data); // <-- Add this

    setCustomers(data.customers || []);
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="customers-page">
      <h2>Customers</h2>

      <div className="customers-filters">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="customers-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Orders</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c._id}>
              <td>{c._id}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.ordersCount}</td>
              <td>
                <Link to={`/customers/${c._id}`}>View</Link>
                <button className="delete-btn" onClick={() => handleDelete(c._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
