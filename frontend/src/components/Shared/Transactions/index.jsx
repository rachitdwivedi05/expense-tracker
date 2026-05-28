import { DeleteOutlined, DownloadOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Form, Input, InputNumber, Modal, Popconfirm, Select, Statistic, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import http, { apiUrl } from "../../../utils/http";
import { formatDate } from "../../../utils/date";

const { Item } = Form;

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const typeOptions = [
  { label: "Income", value: "cr" },
  { label: "Expense", value: "dr" },
];

const paymentOptions = [
  { label: "Cash", value: "cash" },
  { label: "Online", value: "online" },
];

const downloadCsv = (rows) => {
    const headers = ["Type", "Title", "Category", "Amount", "Payment Method", "Notes", "Date"];
    const body = rows.map((item) => [
        item.transactionType === "cr" ? "Income" : "Expense",
        item.title,
        item.category || "general",
        item.amount,
        item.paymentMethod,
        item.notes || "",
        formatDate(item.createdAt),
    ]);
    const csv = [headers, ...body]
        .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
        .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
}

const Transactions = () => {

    const [transactionForm] = Form.useForm();

    const [edit, setEdit] = useState(null);
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [transactions, setTransactions] = useState([]);
    const [filters, setFilters] = useState({
        search: "",
        type: "all",
        paymentMethod: "all",
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0
    });

    const fetchTransaction = async (page = 1, pageSize = 5, activeFilters = filters) => { 
        try {
         setLoading(true);
         const params = new URLSearchParams({
            page,
            limit: pageSize,
         });

         if (activeFilters.search) params.set("search", activeFilters.search.trim());
         if (activeFilters.type !== "all") params.set("type", activeFilters.type);
         if (activeFilters.paymentMethod !== "all") params.set("paymentMethod", activeFilters.paymentMethod);

         const res = await http.get(apiUrl(`/api/transaction/get?${params.toString()}`));  
         
         const { data, total } = res.data;
            setTransactions(data);
            setPagination({
                current: page,
               pageSize : pageSize,
                total :total
            })
        } catch {
         toast.error("failed to fetch transactions !")   
        } finally{
            setLoading(false);
        }

    }

    useEffect(() => {
        fetchTransaction(
            pagination.current,
            pagination.pageSize,
            filters
        );
    }, [])


// submit form
    const onFinish = async (values) => {
        try {
            setLoading(true);
            await http.post(apiUrl("/api/transaction/create"), values);
            toast.success("Transaction created successfully !");
            setModal(false);
            transactionForm.resetFields();
            fetchTransaction(1, pagination.pageSize, filters);
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message);
        }finally{
            setLoading(false);
        }


    }

    const onUpdate = async (values) => {
        try {
            setLoading(true);
            await http.put(apiUrl(`/api/transaction/update/${edit._id}`), values);
            toast.success("Transaction updated successfully !");
            setModal(false);
            transactionForm.resetFields();
            setEdit(null);
            fetchTransaction(pagination.current, pagination.pageSize, filters);
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message);
        }finally{
            setLoading(false);
        }


    }


    const onDelete = async (id) => {
        try {
            setLoading(true);
            await http.delete(apiUrl(`/api/transaction/delete/${id}`));
            toast.success("Transaction deleted successfully !");
            setModal(false);
            transactionForm.resetFields();
            fetchTransaction(pagination.current, pagination.pageSize, filters);
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }

    const onEditTransaction = (obj) => {
        setEdit(obj);
        transactionForm.setFieldsValue(obj);
        setModal(true);
    }

    const columns = [
        {
            title: "Transaction Type",
            dataIndex: "transactionType",
            key: "transactionType",
            render: (type) => (
                <Tag color={type === "cr" ? "green" : "red"}>
                    {type === "cr" ? "Income" : "Expense"}
                </Tag>
            )
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            className : "capitalize"
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            className : "capitalize",
            render: (value) => value || "general"
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (amount) => money(amount)
        },
        {
            title: "Payment Method",
            dataIndex: "paymentMethod",
            key: "paymentMethod",
            className : "capitalize"
        },
        {
            title: "Notes",
            dataIndex: "notes",
            key: "notes",
            className : "capitalize",
            ellipsis: true
        },
        {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render : (date) => formatDate(date)
        },
        {
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_, obj) => (
                <div className="flex gap-1">
                    <Popconfirm
                    title="Are you sure ?"
                    description="You can update this transaction after reviewing it."
                    onCancel={()=> toast.info("No Changes Occur")} 
                    onConfirm={()=>onEditTransaction(obj)}
                    >
                        <Button
                        type="text"
                        className="bg-green-100! text-green-500!"
                        icon={<EditOutlined />}
                        />
                    </Popconfirm>
                    <Popconfirm
                    title="Are you sure ?"
                    description="Once you delete, you can't undo this action !"
                    onCancel={()=> toast.info("Your data is safe")}
                    onConfirm={() => onDelete(obj._id)}
                    >
                        <Button
                        type="text"
                        className="bg-rose-100! text-rose-500!"
                        icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </div>
            )
        },
    ];


    const handleTableChange = (pagination) => {
        fetchTransaction(
            pagination.current, pagination.pageSize, filters
        );
    }

    const onSearch = (value) => {
        const nextFilters = { ...filters, search: value };
        setFilters(nextFilters);
        fetchTransaction(1, pagination.pageSize, nextFilters);
    }

    const onFilterChange = (key, value) => {
        const nextFilters = { ...filters, [key]: value };
        setFilters(nextFilters);
        fetchTransaction(1, pagination.pageSize, nextFilters);
    }

    const visibleIncome = transactions
        .filter((item) => item.transactionType === "cr")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const visibleExpenses = transactions
        .filter((item) => item.transactionType === "dr")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);


    return (
        
        <div className="space-y-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
                <p className="text-sm text-slate-500">Add, edit, search, and filter your income and expenses.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="shadow-sm">
                    <Statistic title="Visible Income" value={visibleIncome} formatter={(value) => money(value)} valueStyle={{ color: "#16a34a" }} />
                </Card>
                <Card className="shadow-sm">
                    <Statistic title="Visible Expenses" value={visibleExpenses} formatter={(value) => money(value)} valueStyle={{ color: "#dc2626" }} />
                </Card>
                <Card className="shadow-sm">
                    <Statistic title="Visible Balance" value={visibleIncome - visibleExpenses} formatter={(value) => money(value)} valueStyle={{ color: "#2563eb" }} />
                </Card>
            </div>

            <div className="grid">
            <Card
            title="Transactions List"
            extra={
                <div className="mt-2 flex flex-col gap-3 lg:mt-0 lg:flex-row">   
                <Input.Search
                allowClear
                placeholder="Search title, note, category"
                prefix={<SearchOutlined />}
                onSearch={onSearch}
                onChange={(event) => {
                    if (!event.target.value) onSearch("");
                }}
                className="min-w-52"
                /> 
                <Select
                    value={filters.type}
                    onChange={(value) => onFilterChange("type", value)}
                    className="min-w-36 text-left"
                    options={[{ label: "All types", value: "all" }, ...typeOptions]}
                />
                <Select
                    value={filters.paymentMethod}
                    onChange={(value) => onFilterChange("paymentMethod", value)}
                    className="min-w-36 text-left"
                    options={[{ label: "All methods", value: "all" }, ...paymentOptions]}
                />
                <Button
                    icon={<DownloadOutlined />}
                    disabled={!transactions.length}
                    onClick={() => downloadCsv(transactions)}
                >
                    Export
                </Button>
                <Button
                    type="primary"
                    className="font-semibold!"
                    onClick={() => {
                        setEdit(null);
                        transactionForm.resetFields();
                        setModal(true);
                    }}
                >
                    Add transaction
                </Button>
                </div>
            }
            >
            <Table 
                columns={columns}
                dataSource={transactions}
                scroll={{ x: "max-content" }}
                loading={loading}
                rowKey="_id"
                pagination={pagination}
                onChange={handleTableChange}
                locale={{ emptyText: <Empty description="No transactions found" /> }}
            />   
              
            </Card>
            </div>
            <Modal
                open={modal}
                onCancel={()=> {
                    setModal(false)
                    setEdit(null)
                    transactionForm.resetFields();
                }}
                title={edit ? "Edit Transaction" : "Add New Transaction"}
                footer={null}
            >
                <Form
                    layout="vertical"
                    form={transactionForm}
                    onFinish={edit ? onUpdate : onFinish}
                >
                    <div
                        className="grid md:grid-cols-2 gap-x-3">
                        <Item
                        label="Transaction Type"
                        name="transactionType"
                        rules={[ { required: true}]}
                        >
                            <Select
                                placeholder="Transaction Type"
                                options={typeOptions}
                            />
                        </Item>
                        <Item
                        label="Amount"
                        name="amount"
                        rules={[ { required: true, message: "Please enter amount" }]}
                        >
                            <InputNumber
                                className="w-full!"
                                min={1}
                                placeholder="Enter Amount"
                            />
                        </Item>
                        <Item
                        label="Title"
                        name="title"
                        rules={[ { required: true, message: "Please enter title" }]}
                        >
                            <Input placeholder="Enter Title" />
                        </Item>
                        <Item
                        label="Payment Method"
                        name="paymentMethod"
                        rules={[ { required: true, message: "Please select payment method" }]}
                        >
                            <Select
                                placeholder="Payment Method"
                                options={paymentOptions}
                            />
                        </Item>
                        <Item
                        label="Category"
                        name="category"
                        rules={[ { required: true, message: "Please enter category" }]}
                        >
                            <Input placeholder="Food, rent, salary" />
                        </Item>
                    </div>
                    <Item
                    label="Notes"
                    name="notes">
                        <Input.TextArea rows={3} placeholder="Add a short note" />
                    </Item>

                    <Item className="mb-0! flex justify-end items-center ">
                        <Button
                        loading={loading}
                        type="primary"
                        htmlType="submit"
                        className="font-semibold!"
                        >
                            {edit ? "Update" : "Submit"}
                        </Button>
                    </Item>
                </Form>
            </Modal>
        </div>
        
    )
}
export default Transactions;
