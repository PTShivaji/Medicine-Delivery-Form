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
    deliveryStatus: "Delivered"
  });
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedPaymentRow, setSelectedPaymentRow] = useState(null);
  const [editId, setEditId] = useState(null);

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
    const { building, flatNumber, amount, deliveryStatus } = newEntry;
    if (!building || building === "Select") return toast.error("Please select a building");
    if (!flatNumber || flatNumber === "Select") return toast.error("Please select a flat number");

    const payload = {
      building,
      flatNumber,
      amount,
      deliveryStatus,
      deliveryTime: new Date(),
      paymentStatus: "Unpaid"
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
      setNewEntry({ building: "Requizza", flatNumber: "", amount: "", deliveryStatus: "Delivered" });
    } catch (err) {
      console.error("Error saving delivery:", err);
      toast.error("Error saving delivery");
    }
  };

  const updatePaymentStatus = async (id, status) => {
    try {
      await fetch(`${BASE_URL}/api/deliveries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: status }),
      });
      toast.success("Payment status updated");
      fetchDeliveries();
      setShowPaymentPopup(false);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
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

  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const formatCurrency = (amount) => `₹${amount}`;
  const formatTime = (time) => new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-center mb-6">B STAR PHARMA</h1>

      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => { setShowAddPopup(true); setEditId(null); }}>
          Add
        </button>

        <div className="flex gap-2 overflow-x-auto">
          {buildingOptions.map((b) => (
            <button key={b} className={`px-3 py-1 rounded-full border ${selectedBuilding === b ? "bg-blue-100 text-blue-700" : "bg-white"}`} onClick={() => setSelectedBuilding(b)}>
              {b}
            </button>
          ))}
        </div>

        <input type="date" className="px-3 py-2 border rounded" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Actions</th>
              <th className="p-2">Building</th>
              <th className="p-2">Flat</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Payment</th>
              <th className="p-2">Timer</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, i) => (
              <tr key={row._id || i} className="border-t text-sm text-center">
                <td className="p-2 align-middle flex justify-center gap-2">
                  <Pencil size={16} className="text-blue-500 cursor-pointer" onClick={() => {
                    setEditId(row._id);
                    setNewEntry({
                      building: row.building,
                      flatNumber: row.flatNumber,
                      amount: row.amount,
                      deliveryStatus: row.deliveryStatus
                    });
                    setShowAddPopup(true);
                  }} />
                  <Trash2 size={16} className="text-red-500 cursor-pointer" onClick={() => handleDeleteDelivery(row._id)} />
                </td>
                <td className="p-2 align-middle">{row.building}</td>
                <td className="p-2 align-middle">{row.flatNumber}</td>
                <td className="p-2 align-middle">{formatCurrency(row.amount)}</td>
                <td className="p-2 align-middle">
                  <select className="border rounded px-2 py-1 bg-white" value={row.deliveryStatus} onChange={(e) => handleStatusChange(row._id, e.target.value)}>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
                <td className="p-2 align-middle cursor-pointer" onClick={() => {
                  setSelectedPaymentRow(row);
                  setShowPaymentPopup(true);
                }}>
                  <span className={`text-lg ${row.paymentStatus === "Paid" ? "text-green-500" : "text-red-500"}`}>●</span> {row.paymentStatus}
                </td>
                <td className="p-2 align-middle">
                  <div className="min-h-[40px]">
                    <DeliveryTimer status={row.deliveryStatus} deliveryTime={row.deliveryTime || row.createdAt} />
                    <div className="text-xs text-gray-500">{formatTime(row.deliveryTime || row.createdAt)}</div>
                  </div>
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

      {/* Add Popup */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[300px]">
            <h2 className="text-lg font-semibold mb-4">{editId ? "Edit" : "Add"} Delivery</h2>
            <select className="w-full mb-3 p-2 border rounded" value={newEntry.building} onChange={(e) => setNewEntry({ ...newEntry, building: e.target.value, flatNumber: "" })}>
              {buildingOptions.filter((b) => b !== "All").map((b) => <option key={b}>{b}</option>)}
            </select>
            <select className="w-full mb-3 p-2 border rounded" value={newEntry.flatNumber} onChange={(e) => setNewEntry({ ...newEntry, flatNumber: e.target.value })}>
              <option value="">Select Flat</option>
              {(flatNumbersMap[newEntry.building] || []).map((flat) => <option key={flat}>{flat}</option>)}
            </select>
            <input type="number" className="w-full mb-3 p-2 border rounded" placeholder="Amount" value={newEntry.amount} onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })} />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-1 bg-gray-300 rounded" onClick={() => { setShowAddPopup(false); setEditId(null); }}>Cancel</button>
              <button className="px-4 py-1 bg-blue-600 text-white rounded" onClick={handleAddDelivery}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Popup */}
      {showPaymentPopup && selectedPaymentRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[300px]">
            <h2 className="text-lg font-bold mb-4">Update Payment</h2>
            {["Unpaid", "Paid"].map((status) => (
              <label key={status} className="block mb-2">
                <input type="radio" name="payment" value={status} checked={selectedPaymentRow.paymentStatus === status} onChange={() => updatePaymentStatus(selectedPaymentRow._id, status)} className="mr-2" />
                {status}
              </label>
            ))}
            <div className="flex justify-end">
              <button className="mt-4 bg-gray-300 px-4 py-1 rounded" onClick={() => setShowPaymentPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
