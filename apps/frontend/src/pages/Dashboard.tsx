import DashboardLayout from "../components/layout/DashboardLayout";
import OrdersTable from "../components/orders/OrdersTable";

export default function Dashboard() {
  return (
    <DashboardLayout>

      <h2 className="text-2xl font-semibold mb-6">
        Orders Dashboard
      </h2>

      <OrdersTable />

    </DashboardLayout>
  );
}
