import React, { useState, useMemo, useEffect } from "react";
import { getClients } from "../api/clientService";
import AddClientForm from "../components/AddClientForm";
import ClientDetailsModal from "../components/ClientDetailsModal";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await getClients();
      setClients(res.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((c) => {
      return (
        (c.owner1 && c.owner1.toLowerCase().includes(term)) ||
        (c.owner2 && c.owner2.toLowerCase().includes(term)) ||
        (c.contact && c.contact.toLowerCase().includes(term))
      );
    });
  }, [clients, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans text-gray-800">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-indigo-700">
          Clients
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by Owner or Contact"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-5 py-3 border border-gray-300 rounded-lg shadow-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
              transition duration-200"
          />
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg
              shadow-md transition duration-200 font-semibold whitespace-nowrap"
          >
            {showForm ? "Close Form" : "Add Client"}
          </button>
        </div>
      </header>

      {showForm && (
        <div className="mb-10">
          <AddClientForm
            setClients={setClients}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <section className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 bg-white">
        <table className="min-w-full border-collapse">
          <thead className="bg-indigo-50">
            <tr>
              {[
                "Owner 1",
                "Owner 2",
                "Address",
                "Contact",
                "Email",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="text-left px-6 py-4 text-indigo-700 font-semibold tracking-wide border-b border-indigo-100"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-gray-400 italic select-none"
                >
                  No clients found.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr
                  key={client._id}
                  className="border-b border-gray-100 hover:bg-indigo-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {client.owner1}
                  </td>
                  <td className="px-6 py-4">{client.owner2}</td>
                  <td className="px-6 py-4">{client.address}</td>
                  <td className="px-6 py-4">{client.contact}</td>
                  <td className="px-6 py-4">{client.email}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      More Info
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};

export default Clients;
