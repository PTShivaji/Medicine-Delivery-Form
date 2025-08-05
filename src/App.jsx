import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import DeliveryTimer from "./DeliveryTimer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "http://localhost:5000";

const buildingOptions = ["All", "Requizza", "Hydra", "Hercules", "Firenze", "Brichwood"];
const flatNumbersMap = {
  Requizza: ["101", "102", "103"],
  Hydra: ["201", "202", "203"],
  Hercules: ["301", "302", "303"],
  Firenze: ["401", "402", "403"],
  Brichwood: ["501", "502", "503"],
};

const App = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newEntry, setNewEntry] = useState({
    building: "Requizza",
    flatNumber: "",
    amount: "",
  });
  const [editId, setEditId] = useState(null);

  const [paymentPopupVisible, setPaymentPopupVisible] = useState(false);
  const [selectedPaymentRow, setSelectedPaymentRow] = useState(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("Unpaid");

  const rowsPerPage = 10;

  const fetchDeliveries = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/deliveries`);
      const data = await response.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    const filtered = rows.filter((row) => {
      const matchesBuilding = selectedBuilding === "All" || row.building === selectedBuilding;
      const createdDate = new Date(row.createdAt || row.deliveryTime).toISOString().split("T")[0];
      const matchesDate = selectedDate === createdDate;
      return matchesBuilding && matchesDate;
    });
    setFilteredRows(filtered);
    setCurrentPage(1);
  }, [rows, selectedBuilding, selectedDate]);

  const handleAddDelivery = async () => {
    const { building, flatNumber, amount } = newEntry;
    if (!building) return toast.error("Please select a building");
    if (!flatNumber) return toast.error("Please select a flat number");

    const payload = {
      building,
      flatNumber,
      amount,
      deliveryStatus: "Delivered",
      deliveryTime: new Date(),
      paymentStatus: "Unpaid",
    };

    try {
      if (editId) {
        await fetch(`${BASE_URL}/api/deliveries/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Delivery updated successfully");
        fetchDeliveries();
      } else {
        const response = await fetch(`${BASE_URL}/api/deliveries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        setRows([...rows, result]);
        toast.success("Delivery added successfully");
      }

      setShowAddPopup(false);
      setEditId(null);
      setNewEntry({ building: "Requizza", flatNumber: "", amount: "" });
    } catch (err) {
      console.error("Error saving delivery:", err);
      toast.error("Error saving delivery");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const payload = { deliveryStatus: newStatus };
      if (newStatus === "Out for Delivery") {
        payload.deliveryTime = new Date().toISOString();
      }

      const response = await fetch(`${BASE_URL}/api/deliveries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Delivery status updated");
        fetchDeliveries();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  const handleDeleteDelivery = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery?")) return;
    try {
      await fetch(`${BASE_URL}/api/deliveries/${id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r._id !== id));
      toast.success("Delivery deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete delivery");
    }
  };

  const handlePaymentClick = (row) => {
    setSelectedPaymentRow(row);
    setSelectedPaymentStatus(row.paymentStatus);
    setPaymentPopupVisible(true);
  };

  const handleUpdatePayment = async () => {
    try {
      await fetch(`${BASE_URL}/api/deliveries/${selectedPaymentRow._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: selectedPaymentStatus }),
      });
      toast.success("Payment status updated");
      fetchDeliveries();
    } catch (err) {
      console.error("Error updating payment status:", err);
      toast.error("Failed to update payment status");
    }
    setPaymentPopupVisible(false);
    setSelectedPaymentRow(null);
  };

  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const formatCurrency = (amount) => `₹${amount}`;
  const formatTime = (time) => new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <ToastContainer />

      {showAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4 text-center">{editId ? "Edit Delivery" : "Add Delivery"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Building</label>
                <select
                  className="w-full border px-3 py-2 rounded mt-1"
                  value={newEntry.building}
                  onChange={(e) => setNewEntry({ ...newEntry, building: e.target.value, flatNumber: "" })}
                >
                  {Object.keys(flatNumbersMap).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Flat Number</label>
                <select
                  className="w-full border px-3 py-2 rounded mt-1"
                  value={newEntry.flatNumber}
                  onChange={(e) => setNewEntry({ ...newEntry, flatNumber: e.target.value })}
                >
                  <option value="">Select</option>
                  {(flatNumbersMap[newEntry.building] || []).map((flat) => (
                    <option key={flat} value={flat}>{flat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Amount</label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded mt-1"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowAddPopup(false)}>Cancel</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAddDelivery}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentPopupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4 text-center">Update Payment</h2>
            <div className="space-y-2">
              {["Paid", "Unpaid"].map(status => (
                <label key={status} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value={status}
                    checked={selectedPaymentStatus === status}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  />
                  {status}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setPaymentPopupVisible(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleUpdatePayment}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800 tracking-wide">B STAR PHARMA</h1>
        </div>

        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow" onClick={() => {
            setShowAddPopup(true);
            setEditId(null);
            setNewEntry({ building: "Requizza", flatNumber: "", amount: "" });
          }}>
            Add
          </button>

          <div className="flex flex-wrap justify-center gap-2 flex-1">
            {buildingOptions.map((b) => (
              <button key={b} className={`px-4 py-1 rounded-full text-sm font-medium transition ${selectedBuilding === b ? "bg-blue-600 text-white" : "bg-white border text-gray-700"}`} onClick={() => setSelectedBuilding(b)}>
                {b}
              </button>
            ))}
          </div>

          <input type="date" className="px-3 py-2 border rounded shadow-sm" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded overflow-hidden text-sm text-center">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">Actions</th>
                <th className="p-3">Building</th>
                <th className="p-3">Flat</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Timer</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, i) => (
                <tr key={row._id || i} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-2 flex justify-center gap-2">
                    <Pencil size={16} className="text-blue-500 cursor-pointer" onClick={() => {
                      setEditId(row._id);
                      setNewEntry({ building: row.building, flatNumber: row.flatNumber, amount: row.amount });
                      setShowAddPopup(true);
                    }} />
                    <Trash2 size={16} className="text-red-500 cursor-pointer" onClick={() => handleDeleteDelivery(row._id)} />
                  </td>
                  <td className="p-2">{row.building}</td>
                  <td className="p-2">{row.flatNumber}</td>
                  <td className="p-2 font-medium">{formatCurrency(row.amount)}</td>
                  <td className="p-2">
                    <select className="border px-2 py-1 rounded bg-white text-sm" value={row.deliveryStatus} onChange={(e) => handleStatusChange(row._id, e.target.value)}>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <span className="inline-flex items-center gap-1 font-medium cursor-pointer" onClick={() => handlePaymentClick(row)}>
                      <span className={`text-lg ${row.paymentStatus === "Paid" ? "text-green-500" : "text-red-500"}`}>●</span>
                      <span className="text-gray-800">{row.paymentStatus}</span>
                    </span>
                  </td>
                  <td className="p-2">
                    <DeliveryTimer status={row.deliveryStatus} deliveryTime={row.deliveryTime || row.createdAt} />
                    <div className="text-xs text-gray-400">{formatTime(row.deliveryTime || row.createdAt)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center items-center gap-4 mt-4">
          <button disabled={currentPage === 1} className="bg-gray-300 text-gray-800 px-4 py-1 rounded disabled:opacity-50" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
            Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} className="bg-gray-300 text-gray-800 px-4 py-1 rounded disabled:opacity-50" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
