import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

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
  const [popupPayment, setPopupPayment] = useState("Unpaid");
  const [showPopup, setShowPopup] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [deletePopupIndex, setDeletePopupIndex] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [confirmPaymentIndex, setConfirmPaymentIndex] = useState(null);

  const confirmAddRow = async () => {
    if (!popupAmount.trim()) {
      alert("Amount is required");
      return;
    }
    if (!dummyFlatIds[popupFlat]) {
      alert("Invalid Flat No selected.");
      return;
    }

    const newEntry = {
      building: selectedBuilding,
      flat: popupFlat,
      amount: Number(popupAmount),
      status: "OutForDelivery",
      payment: popupPayment,
      receivedBy: "NotYetReceived",
      deliveryDate: new Date(deliveryDate).toISOString(),
      deliveryTime: new Date().toISOString(),
      deliveryPerson: "Pending",
      deliveredBy: "Pending",
      deliveryType: "Package",
      flatId: dummyFlatIds[popupFlat],
    };

    try {
      let res, data;
      if (editIndex !== null) {
        const deliveryId = rows[editIndex]._id;
        res = await fetch(`http://localhost:5000/api/deliveries/${deliveryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry),
        });
      } else {
        res = await fetch("http://localhost:5000/api/deliveries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry),
        });
      }

      data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save delivery");
        return;
      }

      const updatedRows = [...rows];
      if (editIndex !== null) {
        updatedRows[editIndex] = data.data || data;
      } else {
        updatedRows.push(data.data || data);
      }

      setRows(updatedRows);
      setShowPopup(false);
      setEditIndex(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      setPopupAmount("");
      setPopupFlat("101");
      setSelectedBuilding("All");
      setPopupPayment("Unpaid");
    } catch (err) {
      console.error("Error saving delivery:", err);
      alert("Server error while saving delivery");
    }
  };

  const handleAddRow = () => {
    setPopupAmount("");
    setPopupFlat("101");
    setPopupPayment("Unpaid");
    setEditIndex(null);
    setShowPopup(true);
  };

  const handleEdit = (index) => {
    const row = rows[index];
    setSelectedBuilding(row.building);
    setPopupFlat(row.flat);
    setPopupAmount(row.amount.toString());
    setPopupPayment(row.payment || "Unpaid");
    setEditIndex(index);
    setShowPopup(true);
  };

  const handleDelete = (index) => {
    setDeletePopupIndex(index);
  };

  const confirmDelete = async () => {
    if (deletePopupIndex === null) return;

    const deliveryId = rows[deletePopupIndex]._id;

    try {
      const res = await fetch(`http://localhost:5000/api/deliveries/${deliveryId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete delivery");
        return;
      }

      const newRows = rows.filter((_, i) => i !== deletePopupIndex);
      setRows(newRows);
      setDeletePopupIndex(null);
    } catch (err) {
      console.error("Error deleting delivery:", err);
      alert("Server error while deleting delivery");
    }
  };

  const confirmPaymentPopup = (index) => {
    setConfirmPaymentIndex(index);
  };

  const confirmPaymentStatus = (status) => {
    const updatedRows = [...rows];
    updatedRows[confirmPaymentIndex].payment = status;
    setRows(updatedRows);
    setConfirmPaymentIndex(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-6 relative">
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          Saved Successfully
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 sm:mb-0">B STAR PHARMA</h1>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-6 mt-4">
          {buildingOptions.map((name) => (
            <button
              key={name}
              className={`px-4 py-2 rounded-full border hover:bg-blue-100 transition ${
                selectedBuilding === name ? "bg-blue-200 font-semibold" : "bg-gray-100"
              }`}
              onClick={() => setSelectedBuilding(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleAddRow}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add
          </button>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="border rounded px-3 py-2 text-center"
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-600 px-4">
            <p>Actions</p>
            <p>Building</p>
            <p>Flat No</p>
            <p>Amount</p>
            <p>Status</p>
            <p>Payment</p>
          </div>
          {rows.map((row, index) => (
            <div key={row._id || index} className="border rounded-lg p-4 shadow-sm bg-gray-50">
              <div className="grid grid-cols-6 gap-4 text-sm items-center font-medium text-gray-700">
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(index)} className="text-blue-600 hover:text-blue-800">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(index)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p>{row.building}</p>
                <p>{row.flat}</p>
                <p>₹ {row.amount}</p>
                <p>{row.status}</p>
                <div
                  className="flex items-center justify-start cursor-pointer"
                  onClick={() => confirmPaymentPopup(index)}
                >
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${row.payment === "Paid" ? "bg-green-500" : "bg-red-500"}`}
                    title={row.payment}
                  />
                  <span>{row.payment || "Unpaid"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {confirmPaymentIndex !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
              <p className="mb-4 text-lg font-semibold text-gray-700">Are you sure to mark payment?</p>
              <div className="flex justify-center gap-6 mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="confirm-payment"
                    value="Paid"
                    onChange={() => confirmPaymentStatus("Paid")}
                    className="form-radio text-green-500"
                  />
                  <span className="ml-2">Paid</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="confirm-payment"
                    value="Unpaid"
                    onChange={() => confirmPaymentStatus("Unpaid")}
                    className="form-radio text-red-500"
                  />
                  <span className="ml-2">Unpaid</span>
                </label>
              </div>
              <button
                onClick={() => setConfirmPaymentIndex(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
              <p className="mb-4 text-lg font-semibold text-gray-700 text-center">
                {editIndex !== null ? "Edit Delivery" : "Add New Delivery"}
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Building</label>
                  <select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="w-full border px-2 py-1 rounded"
                  >
                    {buildingOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Flat No</label>
                  <select
                    value={popupFlat}
                    onChange={(e) => setPopupFlat(e.target.value)}
                    className="w-full border px-2 py-1 rounded"
                  >
                    {flatOptions.map((flat) => (
                      <option key={flat} value={flat}>{flat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    placeholder="₹"
                    value={popupAmount}
                    onChange={(e) => setPopupAmount(e.target.value)}
                    className="w-full border px-2 py-1 rounded"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={confirmAddRow} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
                <button onClick={() => { setShowPopup(false); setEditIndex(null); }} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
