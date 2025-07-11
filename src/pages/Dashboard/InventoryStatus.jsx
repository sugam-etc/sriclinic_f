import React from "react";
import { FaBox, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

const InventoryStatus = ({ inventory = [] }) => {
  const criticalItems = inventory.filter(
    (item) =>
      item.quantity !== undefined &&
      item.threshold !== undefined &&
      item.quantity <= item.threshold &&
      item.quantity > 0
  ).length;

  const outOfStockItems = inventory.filter(
    (item) => item.quantity === 0
  ).length;

  const healthyItems = inventory.length - criticalItems - outOfStockItems;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-5">
        Inventory Status
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-100">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-4 text-xl" />
            <div>
              <h3 className="text-base font-medium text-gray-800">
                Out of Stock
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Items needing immediate restock
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-red-600">
            {outOfStockItems}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 border border-orange-100">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-orange-500 mr-4 text-xl" />
            <div>
              <h3 className="text-base font-medium text-gray-800">Low Stock</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Items below threshold
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-orange-600">
            {criticalItems}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-100">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 mr-4 text-xl" />
            <div>
              <h3 className="text-base font-medium text-gray-800">In Stock</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Items with sufficient quantity
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-green-600">
            {healthyItems}
          </span>
        </div>
      </div>

      <a
        href="/inventory"
        className="mt-6 inline-block text-sm font-medium text-orange-600 hover:text-orange-800 flex items-center group"
      >
        Manage Inventory
        <span className="ml-1 text-lg group-hover:translate-x-1 transition-transform">
          →
        </span>
      </a>
    </div>
  );
};

export default InventoryStatus;
