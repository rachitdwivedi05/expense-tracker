import { Card, Empty } from "antd";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const DailyTransactionChart = ({ transactions = [] }) => (
  <Card title="Daily Transaction Summary (Last 30 Days)" className="shadow-sm">
    {transactions.some((item) => Number(item.total) > 0) ? (
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={transactions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" minTickGap={28} />
            <YAxis tickFormatter={(value) => money(value)} width={90} />
            <Tooltip formatter={(value) => money(value)} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <div className="flex h-72 items-center justify-center">
        <Empty description="No daily transactions yet" />
      </div>
    )}
  </Card>
);

export default DailyTransactionChart;
