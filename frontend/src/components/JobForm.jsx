import { useState } from "react";
import API from "../services/api";

export default function JobForm({ fetchJobs }) {
  const [form, setForm] = useState({
    company: "",
    position: "",
    status: "Applied",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/jobs", form);
    setForm({ company: "", position: "", status: "Applied", notes: "" });
    fetchJobs();
  };

  // Status color mapping for select dropdown
  const getStatusColor = (status) => {
    const colors = {
      Applied: "text-blue-600",
      Interview: "text-yellow-600",
      Offer: "text-green-600",
      Rejected: "text-red-600",
    };
    return colors[status] || "text-gray-600";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Job Application</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Company *
        </label>
        <input
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 text-gray-900 font-medium"
          placeholder="Enter company name"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Position *
        </label>
        <input
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 text-gray-900 font-medium"
          placeholder="Enter job position"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Status
        </label>
        <select
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 font-medium ${getStatusColor(form.status)}`}
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="Applied" className="text-blue-600">📝 Applied</option>
          <option value="Interview" className="text-yellow-600">🎯 Interview</option>
          <option value="Offer" className="text-green-600">🎉 Offer</option>
          <option value="Rejected" className="text-red-600">❌ Rejected</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Notes
        </label>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 resize-none text-gray-900"
          placeholder="Add any notes about the application..."
          rows="3"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] shadow-md"
      >
        + Add Job Application
      </button>
    </form>
  );
}