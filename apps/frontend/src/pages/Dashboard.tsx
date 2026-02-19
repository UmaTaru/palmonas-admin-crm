import { useEffect, useState } from "react";
import api from "../api/client";

export default function Dashboard() {

  const [orders,setOrders]=useState([]);

  useEffect(()=>{
    fetchOrders();
  },[]);

  async function fetchOrders(){
    const res = await api.get("/orders?page=1&limit=10");
    setOrders(res.data.data);
  }

  return (
    <div>
      <h2>Orders Dashboard</h2>

      <table border={1}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Channel</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o:any)=>(
            <tr key={o.id}>
              <td>{o.order_number}</td>
              <td>{o.channel}</td>
              <td>{o.status}</td>
              <td>{o.total_amount}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}
