import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  TransactionOutlined,
} from "@ant-design/icons";
import { Card, Empty, Table, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "react-toastify";
import http, { apiUrl } from "../../../utils/http";
import { formatDate } from "../../../utils/date";
import Loader from "../Loader";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2"];

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const StatCard = ({ title, value, icon, tone }) => (
  <Card className="shadow-sm border-slate-100">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h2 className={`mt-2 text-2xl font-bold ${tone}`}>{value}</h2>
      </div>
      <div className={`grid h-11 w-11 place-items-center rounded-full bg-slate-100 ${tone}`}>
        {icon}
      </div>
    </div>
  </Card>
);

const EmptyChart = ({ text }) => (
  <div className="flex h-72 items-center justify-center">
    <Empty description={text} />
  </div>
);

const Report = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const { data } = await http.get(apiUrl("/api/dashboard/report"));
        setReport(data);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  const columns = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        render: (value) => <span className="capitalize">{value}</span>,
      },
      {
        title: "Type",
        dataIndex: "transactionType",
        render: (value) => (
          <Tag color={value === "cr" ? "green" : "red"}>{value === "cr" ? "Income" : "Expense"}</Tag>
        ),
      },
      {
        title: "Category",
        dataIndex: "category",
        render: (value) => <span className="capitalize">{value || "general"}</span>,
      },
      {
        title: "Amount",
        dataIndex: "amount",
        render: (value) => money(value),
      },
      {
        title: "Date",
        dataIndex: "createdAt",
        render: (value) => formatDate(value),
      },
    ],
    []
  );

  if (loading) return <Loader />;

  if (!report) {
    return (
      <Card>
        <Empty description="Reports are unavailable right now" />
      </Card>
    );
  }

  const {
    summary = {},
    monthlySummary = [],
    categoryBreakdown = [],
    chart = [],
    recentTransactions = [],
  } = report;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Track income, spending, balance, and recent activity.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Income"
          value={money(summary.totalIncome || summary.totalCredit)}
          icon={<ArrowUpOutlined />}
          tone="text-green-600"
        />
        <StatCard
          title="Total Expenses"
          value={money(summary.totalExpenses || summary.totalDebit)}
          icon={<ArrowDownOutlined />}
          tone="text-rose-600"
        />
        <StatCard
          title="Balance"
          value={money(summary.balance)}
          icon={<DollarOutlined />}
          tone="text-blue-600"
        />
        <StatCard
          title="Transactions"
          value={summary.totalTransactions || 0}
          icon={<TransactionOutlined />}
          tone="text-violet-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card title="Monthly Summary" className="shadow-sm xl:col-span-3">
          {monthlySummary.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                  <Tooltip formatter={(value) => money(value)} />
                  <Bar dataKey="income" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" fill="#dc2626" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart text="No monthly data yet" />
          )}
        </Card>

        <Card title="Category Breakdown" className="shadow-sm xl:col-span-2">
          {categoryBreakdown.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" outerRadius={95} label>
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => money(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart text="No expense categories yet" />
          )}
        </Card>
      </div>

      <Card title="Spending Trends" className="shadow-sm">
        {chart.some((item) => Number(item.total) > 0) ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
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
          <EmptyChart text="No trend data yet" />
        )}
      </Card>

      <Card title="Recent Transactions" className="shadow-sm">
        <Table
          columns={columns}
          dataSource={recentTransactions}
          rowKey="_id"
          pagination={false}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: <Empty description="No transactions yet" /> }}
        />
      </Card>
    </div>
  );
};

export default Report;
