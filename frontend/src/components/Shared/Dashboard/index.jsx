import { Button, Card, Empty, Table, Tag } from "antd";
import {
  BarChartOutlined,
  DollarCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import http, { apiUrl } from "../../../utils/http";
import Loader from "../Loader";
import DailyTransactionChart from "../DailyTransactions";
import { formatDate } from "../../../utils/date";

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const metricCards = [
  {
    key: "totalTransactions",
    label: "Transactions",
    tone: "text-rose-600",
    bg: "bg-rose-50",
    icon: <BarChartOutlined />,
    format: (value) => value || 0,
  },
  {
    key: "totalCredit",
    label: "Income",
    tone: "text-green-600",
    bg: "bg-green-50",
    icon: <PlusCircleOutlined />,
    format: money,
  },
  {
    key: "totalDebit",
    label: "Expenses",
    tone: "text-orange-600",
    bg: "bg-orange-50",
    icon: <MinusCircleOutlined />,
    format: money,
  },
  {
    key: "balance",
    label: "Balance",
    tone: "text-indigo-600",
    bg: "bg-indigo-50",
    icon: <DollarCircleOutlined />,
    format: money,
  },
];

const Dashboard = () => {
  const [report, setReport] = useState();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(false);
      const { data } = await http.get(apiUrl("/api/dashboard/report"));
      setReport(data);
    } catch (err) {
      setError(true);
      toast.error(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (error) {
    return (
      <Card>
        <Empty description="Dashboard data is unavailable" />
      </Card>
    );
  }

  if (!report) return <Loader />;

  const { summary = {}, chart = [], recentTransactions = [] } = report;

  const columns = [
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
      title: "Amount",
      dataIndex: "amount",
      render: money,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: formatDate,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">A quick view of your money movement.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button icon={<ReloadOutlined />} onClick={loadDashboard} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" onClick={() => navigate("../transactions")}>
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <Card key={card.key} className="shadow-sm border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <h2 className={`mt-2 truncate text-2xl font-bold ${card.tone}`}>
                  {card.format(summary[card.key])}
                </h2>
              </div>
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${card.bg} ${card.tone}`}>
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DailyTransactionChart transactions={chart} />
        </div>
        <Card title="Recent Activity" className="shadow-sm">
          <Table
            columns={columns}
            dataSource={recentTransactions.slice(0, 5)}
            rowKey="_id"
            pagination={false}
            size="small"
            scroll={{ x: "max-content" }}
            locale={{ emptyText: <Empty description="No recent transactions" /> }}
          />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
