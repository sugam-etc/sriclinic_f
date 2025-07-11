import { useState, useEffect, useRef } from "react";
import React from "react";
import SalesForm from "../components/SalesForm";
import {
  getSales,
  createSale,
  updateSale,
  deleteSale,
} from "../api/saleService.js";
import {
  getAllInventory,
  updateInventoryItem,
} from "../api/inventoryService.js";
import {
  FaPlus,
  FaChevronLeft,
  FaSearch,
  FaShoppingCart,
  FaTrash,
  FaFileInvoiceDollar,
  FaPrint,
} from "react-icons/fa";
import { format, isSameDay, parseISO } from "date-fns";
import logo from "../assets/clinic.jpg"; // Assuming this path is correct

const SalesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recordToPrint, setRecordToPrint] = useState(null);

  const salesRef = useRef();

  // Function to fetch sales and inventory and update state
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [salesResponse, inventoryResponse] = await Promise.all([
        getSales(),
        getAllInventory(),
      ]);

      // Sort sales by date in descending order (latest first)
      const sortedSales = salesResponse.data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // Latest date first
      });

      setSales(sortedSales);
      setInventory(inventoryResponse);

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "Failed to load sales and inventory data.");
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Toggles the sales form visibility and resets selected sale
  const toggleForm = () => {
    setShowForm((prev) => !prev);
    setSelectedSale(null);
    setError(null); // Clear any previous errors when toggling form

    // When opening the form for a new sale, ensure data is updated
    if (!showForm) {
      fetchAllData(); // Re-fetch all data to get the latest sales and inventory
    }
  };

  // Function to handle printing the invoice using window.print()
  const printRecord = (record) => {
    // Set the record to print, which will conditionally render the invoice template
    setRecordToPrint(record);
    // Use a timeout to ensure React has time to render the invoice template
    // before the print dialog is triggered.
    setTimeout(() => {
      window.print();
      // After printing, clear the record to hide the invoice template again
      setRecordToPrint(null);
    }, 100);
  };

  // Handles deleting a sale and restoring inventory
  const handleDelete = async (id) => {
    // Custom confirmation modal instead of window.confirm
    const confirmDeletion = await new Promise((resolve) => {
      const messageBox = document.createElement("div");
      messageBox.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-xl text-center max-w-sm mx-4">
          <p class="text-lg font-semibold text-gray-800 mb-4">Are you sure you want to delete this sale?</p>
          <div class="flex justify-center gap-4">
            <button id="cancelDelete" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">Cancel</button>
            <button id="confirmDelete" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">Delete</button>
          </div>
        </div>
      `;
      document.body.appendChild(messageBox);

      document.getElementById("cancelDelete").onclick = () => {
        messageBox.remove();
        resolve(false);
      };
      document.getElementById("confirmDelete").onclick = () => {
        messageBox.remove();
        resolve(true);
      };
    });

    if (confirmDeletion) {
      try {
        // Find the sale to delete to restore its items to inventory
        const saleToDelete = sales.find((sale) => sale._id === id);
        if (saleToDelete) {
          const updatePromises = saleToDelete.items.map((item) => {
            const inventoryItem = inventory.find((i) => i._id === item._id);
            if (inventoryItem) {
              // Restore the quantity to the inventory item
              return updateInventoryItem(item._id, {
                quantity: inventoryItem.quantity + item.quantity,
              });
            }
            return Promise.resolve(); // Resolve if item not found in current inventory
          });

          await Promise.all(updatePromises); // Wait for all inventory updates to complete

          // Then delete the sale record
          await deleteSale(id);
          // After deletion, re-fetch all data to update sales list and next invoice number
          fetchAllData();
        }
      } catch (err) {
        console.error("Failed to delete sale or restore inventory:", err);
        setError(err.message || "Failed to delete sale.");
      }
    }
  };

  // Sets the selected sale for viewing in the form
  const handleView = (sale) => {
    setSelectedSale(sale);
    setShowForm(true); // Show the form in view mode
  };

  // Handles the submission of sale data from SalesForm
  // This function is called after SalesForm has handled inventory updates
  const handleSubmitSale = async (saleData) => {
    try {
      // After the SalesForm has handled the inventory updates and sale creation/update,
      // we just need to refresh the sales and inventory data in this component.
      await fetchAllData(); // Re-fetch all data to get the latest sales and inventory
      toggleForm(); // Close the form after successful submission
    } catch (err) {
      console.error("Failed to refresh data after sale submission:", err);
      setError(err.message || "Failed to update sales data.");
    }
  };

  // Filters sales based on the search term
  const filteredSales = sales.filter(
    (sale) =>
      sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Separate today's sales from previous sales
  const today = new Date();
  const todaySalesList = filteredSales.filter((sale) =>
    isSameDay(parseISO(sale.date), today)
  );
  const previousSalesList = filteredSales.filter(
    (sale) => !isSameDay(parseISO(sale.date), today)
  );

  // Calculate sales metrics (these remain the same)
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const todaySales = sales
    .filter(
      (sale) => isSameDay(parseISO(sale.date), new Date()) // Use isSameDay for accurate comparison
    )
    .reduce((sum, sale) => sum + sale.totalAmount, 0);
  const monthlySales = sales
    .filter((sale) => parseISO(sale.date).getMonth() === new Date().getMonth())
    .reduce((sum, sale) => sum + sale.totalAmount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  // Helper function to render the sales table for a given list of sales
  const renderSalesTable = (salesToRender) => (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Client
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Items
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Total
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salesToRender.map((sale) => (
              <tr
                key={sale._id}
                className="hover:bg-orange-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {format(new Date(sale.date), "MMM dd,yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {sale.clientName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {sale.items.map((item) => item.name).join(", ")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  NPR {sale.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleView(sale)}
                      className="text-orange-600 hover:text-orange-800 p-2 rounded-full hover:bg-orange-100 transition-colors"
                      title="View Details"
                    >
                      <FaFileInvoiceDollar className="text-lg" />
                    </button>
                    <button
                      onClick={() => printRecord(sale)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors"
                      title="Print Invoice"
                    >
                      <FaPrint className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(sale._id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                      title="Delete Sale"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-4">
              {showForm && (
                <button
                  onClick={toggleForm}
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                >
                  <FaChevronLeft className="text-gray-600 text-xl" />
                </button>
              )}
              <h1 className="text-4xl font-bold text-gray-900">
                {showForm ? (selectedSale ? "View Sale" : "New Sale") : "Sales"}
              </h1>
            </div>

            {!showForm && (
              <button
                onClick={toggleForm}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 text-lg"
              >
                <FaPlus className="text-xl" />
                <span>New Sale</span>
              </button>
            )}
          </div>

          {!showForm && (
            <div className="mt-6 relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-lg" />
              </div>
              <input
                type="text"
                placeholder="Search by client or item..."
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-orange-500 focus:border-orange-500 text-lg transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </header>

        {/* Display error message if any */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6 shadow-md"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {showForm ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <SalesForm
              sales={sales}
              onSubmit={handleSubmitSale}
              inventory={inventory}
              onCancel={toggleForm}
              selectedSale={selectedSale}
              setInventory={setInventory} // Pass setInventory for local form updates
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Sales Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-orange-500">
                <h3 className="text-lg text-gray-500 mb-2 font-medium">
                  Total Sales
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  NPR {totalSales.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-green-500">
                <h3 className="text-lg text-gray-500 mb-2 font-medium">
                  Today's Sales
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  NPR {todaySales.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-purple-500">
                <h3 className="text-lg text-gray-500 mb-2 font-medium">
                  This Month
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  NPR {monthlySales.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Sales Table */}
            {filteredSales.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <div className="mx-auto max-w-md">
                  <FaShoppingCart className="mx-auto h-20 w-20 text-gray-300 mb-6" />
                  <h3 className="text-3xl font-semibold text-gray-800 mb-3">
                    No sales records found
                  </h3>
                  <p className="text-xl text-gray-500 mb-8">
                    {searchTerm
                      ? "No matching sales found. Try a different search."
                      : "Create your first sale to get started."}
                  </p>
                  <button
                    onClick={toggleForm}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 text-xl"
                  >
                    <FaPlus />
                    <span>Create Sale</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Today's Sales Section */}
                {todaySalesList.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Today's Sales ({format(today, "EEEE, MMMM dd,yyyy")})
                    </h2>
                    {renderSalesTable(todaySalesList)}
                  </div>
                )}

                {/* Previous Sales Section */}
                {previousSalesList.length > 0 && (
                  <div className={todaySalesList.length > 0 ? "mt-8" : ""}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Previous Sales
                    </h2>
                    {/* Render all previous sales in a single table */}
                    {renderSalesTable(previousSalesList)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Invoice Print Template (conditionally rendered for printing) */}
        {recordToPrint && (
          <div className="print-invoice-wrapper">
            <style>
              {`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-invoice-wrapper, .print-invoice-wrapper * {
            visibility: visible;
          }
          .print-invoice-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            max-height: 20px !important;
            margin: 0;
            padding: 0;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
        }
      `}
            </style>

            <div
              ref={salesRef}
              className="bg-white p-4 max-w-md mx-auto text-sm"
            >
              {/* Clinic Header */}
              <div className="flex items-center justify-between mb-4">
                {/* Logo on the left */}
                <div className="flex-shrink-0">
                  <img
                    src={logo}
                    alt="VetCare Clinic Logo"
                    className="w-16 h-16 object-contain"
                  />
                </div>

                {/* Clinic info on the right */}
                <div className="text-right ml-4">
                  <h1 className="text-xl font-bold text-gray-800">
                    Sri Vetenary Clinic
                  </h1>
                  <p className="text-gray-600 text-xs">
                    Nursery Chowk, Dhungedhara
                  </p>
                  <p className="text-gray-600 text-xs">
                    srivetclinic2022@gmail.com
                  </p>
                  <p className="text-gray-600 text-xs">
                    Phone: +977 9849709736, 9808956106
                  </p>
                </div>
              </div>

              {/* Invoice & Client Info */}
              <div className="flex justify-between items-start mb-4">
                <div className="text-left">
                  <h2 className="text-lg font-bold text-gray-800">INVOICE</h2>
                  <p className="text-gray-600 text-xs">
                    Date: {format(new Date(recordToPrint.date), "MMMM dd,yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-gray-800">Bill To:</h3>
                  <p className="text-gray-700 text-xs">
                    {recordToPrint.clientName}
                  </p>
                  <p className="text-gray-700 text-xs">
                    {recordToPrint.clientPhone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-1 px-2 text-left font-bold text-gray-700 border-b text-xs">
                        Item
                      </th>
                      <th className="py-1 px-2 text-right font-bold text-gray-700 border-b text-xs">
                        Price
                      </th>
                      <th className="py-1 px-2 text-right font-bold text-gray-700 border-b text-xs">
                        Qty
                      </th>
                      <th className="py-1 px-2 text-right font-bold text-gray-700 border-b text-xs">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordToPrint.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-1 px-2 text-gray-700 text-xs">
                          {item.name}
                        </td>
                        <td className="py-1 px-2 text-right text-gray-700 text-xs">
                          NPR {item.price.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 text-right text-gray-700 text-xs">
                          {item.quantity}
                        </td>
                        <td className="py-1 px-2 text-right text-gray-700 text-xs">
                          NPR {(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end">
                <div className="w-full">
                  <div className="flex justify-between py-1">
                    <span className="font-bold text-gray-700 text-xs">
                      Items Cost:
                    </span>
                    <span className="text-gray-700 text-xs">
                      NPR {recordToPrint.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {recordToPrint.tax > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="font-bold text-gray-700 text-xs">
                        Tax ({recordToPrint.taxRate}%):
                      </span>
                      <span className="text-gray-700 text-xs">
                        NPR {recordToPrint.tax.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {recordToPrint.discount > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="font-bold text-gray-700 text-xs">
                        Discount:
                      </span>
                      <span className="text-gray-700 text-xs">
                        -NPR {recordToPrint.discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Blank Service Charge line */}
                  <div className="flex justify-between py-1">
                    <span className="font-bold text-gray-700 text-xs">
                      + Service Charge:
                    </span>
                    <span className="text-gray-700 text-xs">
                      NPR {recordToPrint.serviceCharge}
                    </span>
                  </div>

                  {/* Final Total - left blank for handwritten entry */}
                  <div className="flex justify-between py-1 border-t border-gray-200 mt-2">
                    <span className="font-bold text-gray-800 text-sm">
                      Total:
                    </span>
                    <span className="font-bold text-gray-800 text-sm">
                      NPR {recordToPrint.totalBill}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signature & Staff Section */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-left text-xs text-gray-700">
                <div className="mb-6">
                  <p className="mb-1 font-semibold">Sold/Served by:</p>
                  <div className="h-6 border-b border-gray-400 w-48"></div>
                </div>
                <div className="mb-2">
                  <p className="font-semibold">Signature:</p>
                  <div className="h-12 border-b border-gray-400 w-48"></div>
                </div>
              </div>

              {/* Thank You Footer */}
              <div className="mt-4 pt-2 border-t border-gray-200 text-center">
                <p className="text-gray-600 text-xs">
                  Thank you ! <br /> Visit Again
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Invoice generated on{" "}
                  {format(new Date(), "MMMM dd,yyyy hh:mm a")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPage;
