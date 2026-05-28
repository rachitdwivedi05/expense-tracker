import { EyeInvisibleFilled, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Input, Statistic, Table, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import http, { apiUrl } from "../../../utils/http";
import { formatDate } from "../../../utils/date";

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) =>
      [user.fullname, user.email, user.mobile, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [search, users]);

  const activeUsers = users.filter((user) => user.status).length;

  const fetchUsers = async (page = 1, pageSize = 5) => {
    try {
      setLoading(true);
      const res = await http.get(apiUrl(`/api/user/get?page=${page}&limit=${pageSize}`));
      const { data, total } = res.data;
      setUsers(data);
      setPagination({
        current: page,
        pageSize,
        total,
      });
    } catch {
      toast.error("failed to fetch users !");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.current, pagination.pageSize);
  }, [refreshKey]);

  const onStatus = async (obj) => {
    try {
      setLoading(true);
      await http.put(apiUrl(`/api/user/status/${obj._id}`), { status: !obj.status });
      toast.success("status updated successfully !");
      setRefreshKey(refreshKey + 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Full name",
      dataIndex: "fullname",
      key: "fullname",
      render: (value) => <span className="capitalize font-medium text-slate-800">{value}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color="blue" className="capitalize">{role}</Tag>,
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, obj) => (
        <Button
          shape="round"
          icon={status ? <EyeOutlined /> : <EyeInvisibleFilled />}
          className={status ? "bg-green-50! text-green-600!" : "bg-rose-50! text-rose-600!"}
          onClick={() => onStatus(obj)}
          loading={loading}
        >
          {status ? "Active" : "Inactive"}
        </Button>
      ),
    },
  ];

  const handleTableChange = (pagination) => {
    fetchUsers(pagination.current, pagination.pageSize);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">Review users and manage account status.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <Statistic title="Loaded Users" value={users.length} />
        </Card>
        <Card className="shadow-sm">
          <Statistic title="Active Users" value={activeUsers} valueStyle={{ color: "#16a34a" }} />
        </Card>
        <Card className="shadow-sm">
          <Statistic title="Inactive Users" value={users.length - activeUsers} valueStyle={{ color: "#dc2626" }} />
        </Card>
      </div>

      <Card
        title="Users List"
        className="shadow-sm"
        extra={
          <Input
            allowClear
            placeholder="Search users"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-64"
          />
        }
      >
        <Table
          columns={columns}
          dataSource={filteredUsers}
          scroll={{ x: "max-content" }}
          loading={loading}
          rowKey="_id"
          pagination={pagination}
          onChange={handleTableChange}
          locale={{ emptyText: <Empty description="No users found" /> }}
        />
      </Card>
    </div>
  );
};

export default Users;
