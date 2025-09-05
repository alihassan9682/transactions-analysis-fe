import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
export default function LineGraph({pageItems}) {
    
    const [restaurantBookingData,setrestaurantBookingData] = useState()
    useEffect(() => {
    if (pageItems?.length > 0) {
      // Group by date
      const grouped = pageItems.reduce((acc, item) => {
        const date = item.timestamp.split(" ")[0]; // keep only date (YYYY-MM-DD)
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += item.amount  || 0;
        return acc;
      }, {});

      // Convert to array for recharts
      const chartData = Object.entries(grouped).map(([date, total]) => ({
        timestamp: date,
        amount: total,
      }));

      setrestaurantBookingData(chartData);
    }
  }, [pageItems]);
    return (

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Total Amount
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={restaurantBookingData?.length > 0? restaurantBookingData: [{ timestamp: "No Data", amount: 10 }]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="timestamp"
                                    tick={{ fontSize: 12 }}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                    tickLine={{ stroke: "#e5e7eb" }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                    tickLine={{ stroke: "#e5e7eb" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "1px",
                                        boxShadow: "0 1px 1px -1px rgba(0, 0, 0, 0.1)",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#3b82f6"
                                    strokeWidth={1}
                                    dot={{ r: 1, fill: "#3b82f6" }}
                                    activeDot={{ r: 5, fill: "#3b82f6" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                </div>
                
            )
}