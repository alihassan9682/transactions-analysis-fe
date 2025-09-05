import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function PieGraph({ data }) {
  const [countryData, setCountryData] = useState([]);
  console.log(data);

  // Assign a unique color for each country (keys in lowercase for lookup)
  const COLORS = {
    col: "#3b82f6",
    bra: "#10b981",
    cri: "#f59e0b",
    mex: "#ef4444",
    pan: "#8b5cf6",
    gtm: "#f472b6",
  };

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const grouped = {};

      data.forEach(item => {
        const country = (item.country || "").toLowerCase();
        if (country) {
          grouped[country] = (grouped[country] || 0) + 1;
        }
      });

      // Convert country code to uppercase for display
      const chartData = Object.entries(grouped).map(([name, value]) => ({
        name: name.toUpperCase(),
        value
      }));

      setCountryData(chartData);
    }
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction Distribution by Country</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={countryData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={70}   // Donut chart
              dataKey="value"
              label
            >
              {countryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name.toLowerCase()] || "#3b82f6"} // normalize for color lookup
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
