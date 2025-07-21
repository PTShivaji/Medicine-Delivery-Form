import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const buildingOptions = ["All", "Requizza", "Hydra", "Hercules", "Firenza", "Brichwood"];
const flatOptions = ["101", "102", "103", "201", "202", "203"];

const dummyFlatIds = {
  "101": "686bd2e41c842f180f0aba30",
  "102": "686bd2e41c842f180f0aba31",
  "103": "686bd2e41c842f180f0aba32",
  "201": "686bd2e41c842f180f0aba33",
  "202": "686bd2e41c842f180f0aba34",
  "203": "686bd2e41c842f180f0aba35",
};

function App() {
  const today = new Date().toISOString().split("T")[0];
  const [rows, setRows] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState(today);
  const [selectedBuilding, setSelectedBuilding] = useState("All");
  const [popupFlat, setPopupFlat] = useState("101");
  const [popupAmount, setPopupAmount] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [confirmPaymentIndex, setConfirmPaymentIndex] = useState(null);
  const [paymentSelection, setPaymentSelection] = useState(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/deliveries`);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
    }
  };

  const confirmAddRow = async () => {
    if (!popupAmount.trim()) return alert("Amount is required");

    const newEntry = {
      building: selectedBuilding,
      flat: popupFlat,
      amount: Number(popupAmount),
      status: "OutForDelivery",
      paymentStatus: "Unpaid",
      receivedBy: "NotYetReceived",
      deliveryDate: new Date(deliveryDate).toISOString(),
      deliveryTime: new Date().toISOString(),
      deliveryPerson: "Pending",
      deliveredBy: "Pending",
      deliveryType: "Package",
      flatId: dummyFlatIds[popupFlat],
    };

    try {
      const url = editIndex !== null
        ? `${BASE_URL}/api/deliveries/${rows[editIndex]._id}`
        : `${BASE_URL}/api/deliveries`;

      const method = editIndex !== null ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("API error:", data);
        return alert(data.error || "Failed to save delivery");
      }

      const updatedRows = [...rows];
      if (editIndex !== null) {
        updatedRows[editIndex] = data.data || data;
      } else {
        updatedRows.push(data.data || data);
      }

      setRows(updatedRows);
      resetPopup();
    } catch (err) {
      console.error("Server error:", err);
      alert("Error while saving delivery");
    }
  };

  const resetPopup = () => {
    setShowPopup(false);
    setEditIndex(null);
    setPopupAmount("");
    setPopupFlat("101");
    setSelectedBuilding("All");
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const confirmPaymentStatus = async () => {
    if (confirmPaymentIndex === null || !paymentSelection) return;

    const target = rows[confirmPaymentIndex];
    try {
      const res = await fetch(`${BASE_URL}/api/deliveries/${target._id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: paymentSelection }),
      });

      const data = await res.json();
      if (!res.ok) {
        return alert(data.error || "Failed to update payment status");
      }

      const updated = [...rows];
      updated[confirmPaymentIndex] = data.data || data;

      setRows(updated);
      setConfirmPaymentIndex(null);
      setPaymentSelection(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      console.error("Payment update error:", err);
      alert("Error updating payment status");
    }
  };

  const openPaymentPopup = (index) => {
    setConfirmPaymentIndex(index);
    setPaymentSelection(rows[index].paymentStatus || "Unpaid");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-6 relative">
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          Saved Successfully
        </div>
      )}

      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">B STAR PHARMA</h1>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <button onClick={() => setShowPopup(true)} className="bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto">
            Add
          </button>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-auto"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {buildingOptions.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBuilding(b)}
              className={`px-3 py-1 rounded-full text-xs sm:text-sm border ${
                selectedBuilding === b ? "bg-blue-200 font-bold" : "bg-gray-100"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">
            <p>Actions</p>
            <p>Building</p>
            <p>Flat</p>
            <p>Amount</p>
            <p>Status</p>
            <p>Payment</p>
          </div>

          {rows
            .filter((r) => selectedBuilding === "All" || r.building === selectedBuilding)
            .map((r, i) => (
              <div key={r._id || i} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 items-center p-2 sm:p-4 border rounded bg-gray-50 text-xs sm:text-sm">
                <div className="flex gap-2">
                  <button onClick={() => setEditIndex(i) || setShowPopup(true)} className="text-blue-500">
                    <Pencil size={16} />
                  </button>
                  <button className="text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p>{r.building}</p>
                <p>{r.flat}</p>
                <p>₹{r.amount}</p>
                <p>{r.status}</p>
                <div onClick={() => openPaymentPopup(i)} className="flex items-center gap-2 cursor-pointer">
                  <span className={`w-3 h-3 rounded-full ${r.paymentStatus === "Paid" ? "bg-green-500" : "bg-red-500"}`} />
                  {r.paymentStatus}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* POPUPS */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-2">
          <div className="bg-white p-4 sm:p-6 rounded shadow-md w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-center">{editIndex !== null ? "Edit" : "Add"} Delivery</h2>
            <div className="space-y-4">
              <select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} className="w-full border px-2 py-1 rounded">
                {buildingOptions.filter((b) => b !== "All").map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
              <select value={popupFlat} onChange={(e) => setPopupFlat(e.target.value)} className="w-full border px-2 py-1 rounded">
                {flatOptions.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="₹"
                value={popupAmount}
                onChange={(e) => setPopupAmount(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
              <div className="flex justify-center gap-4 pt-2">
                <button onClick={confirmAddRow} className="bg-blue-600 text-white px-4 py-2 rounded">
                  Save
                </button>
                <button onClick={() => setShowPopup(false)} className="bg-gray-300 px-4 py-2 rounded">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmPaymentIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-2">
          <div className="bg-white p-4 sm:p-6 rounded shadow-md max-w-sm w-full text-center">
            <p className="font-semibold mb-4">Mark Payment Status</p>
            <div className="flex justify-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input type="radio" value="Paid" checked={paymentSelection === "Paid"} onChange={() => setPaymentSelection("Paid")} />
                Paid
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="Unpaid" checked={paymentSelection === "Unpaid"} onChange={() => setPaymentSelection("Unpaid")} />
                Unpaid
              </label>
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={confirmPaymentStatus} className="bg-blue-600 text-white px-4 py-2 rounded">
                Confirm
              </button>
              <button onClick={() => setConfirmPaymentIndex(null)} className="bg-gray-300 px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;