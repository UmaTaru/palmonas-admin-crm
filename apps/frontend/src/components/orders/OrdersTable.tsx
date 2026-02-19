import { useEffect, useState } from "react";
import api from "../../api/client";

interface Order {
  channel: string;
  status: string;
  total_amount: number;
  customer_name: string;
  external_order_id: string;
  id: string;
}

export default function OrdersTable() {

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const STATUS_FLOW: Record<string, string[]> = {
  CREATED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};


  function getStatusColor(status: string) {
  switch (status) {
    case "CREATED":
      return "bg-gray-200 text-gray-700";

    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";

    case "SHIPPED":
      return "bg-yellow-100 text-yellow-700";

    case "DELIVERED":
      return "bg-green-100 text-green-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100";
  }
}


async function updateStatus(
  orderId: string,
  status: string
) {
  try {

    setUpdatingId(orderId);

    // ✅ OPTIMISTIC UPDATE
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status }
          : o
      )
    );

    await api.patch(
      `/orders/${orderId}/status`,
      { status }
    );

  } catch {
    alert("Status update failed");
    fetchOrders(); // rollback
  } finally {
    setUpdatingId(null);
  }
}

  async function fetchOrders() {
    try {
      const res = await api.get("/orders?page=1&limit=10");
      console.log("ORDERS DATE",res.data);
      setOrders(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  fetchOrders();

  const interval = setInterval(() => {
    fetchOrders();
  }, 5000); // every 5 sec

  return () => clearInterval(interval);

}, []);


  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm">

      <table className="w-full text-sm">

        <thead className="border-b bg-gray-50">
          <tr>
            <th className="p-3 text-left">Order</th>
            <th className="p-3 text-left">Channel</th>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b hover:bg-gray-50"
            >
              <td className="p-3 font-medium">
                {order.external_order_id || order.id}
              </td>
              <td className="p-3">{order.channel}</td>
              <td className="p-3">{order.customer_name}</td>
              <td className="p-3">₹{order.total_amount}</td>
             <td className="p-3 space-x-2">

  {/* CURRENT STATUS */}
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
      order.status
    )}`}
  >
    {order.status}
  </span>

  {/* ACTION BUTTONS */}
  <div className="mt-2 flex gap-2">

  {STATUS_FLOW[order.status]?.map(
    (nextStatus) => (

      <button
        key={nextStatus}
        disabled={updatingId === order.id}
        onClick={() =>
          updateStatus(order.id, nextStatus)
        }
        className={`
          text-xs px-3 py-1 rounded border
          hover:bg-black hover:text-white
          transition
        `}
      >
        {nextStatus}
      </button>

    )
  )}

</div>


</td>


            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}
