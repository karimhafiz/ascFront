import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import EventHeader from "../components/EventHeader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [ticketData, setTicketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch ticket data from the backend
    const fetchTicketData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_DEV_URI}tickets`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch ticket data.");
        }

        const data = await response.json();

        // Use the data directly from the backend
        setTicketData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ticket data:", error);
        setLoading(false);
      }
    };

    fetchTicketData();
  }, []);

  // Prepare data for the bar chart
  const chartData = {
    labels: ticketData.map((event) => event.title), // Event titles
    datasets: [
      {
        label: "Tickets Sold",
        data: ticketData.map((event) => event.ticketsSold), // Tickets sold
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Tickets Canceled",
        data: ticketData.map((event) => event.ticketsCanceled), // Tickets canceled
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow resizing
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Ticket Sales and Cancellations by Event",
      },
    },
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100">
        <div className="glass-card p-8 rounded-xl flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin mb-4"></div>
          <p className="text-purple-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100">
      <EventHeader />
      <div className="p-6 min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">
          Admin Dashboard
        </h1>

        <div className="glass-card p-6 rounded-2xl shadow-xl backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-4 text-pink-700">
            Ticket Sales Overview
          </h2>
          <div className="h-96 bg-white/50 rounded-xl p-4">
            <Bar
              data={{
                ...chartData,
                datasets: [
                  {
                    ...chartData.datasets[0],
                    backgroundColor: "rgba(147, 51, 234, 0.6)",
                    borderColor: "rgba(147, 51, 234, 1)",
                  },
                  {
                    ...chartData.datasets[1],
                    backgroundColor: "rgba(236, 72, 153, 0.6)",
                    borderColor: "rgba(236, 72, 153, 1)",
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ticketData.map((event, index) => (
            <div
              key={index}
              className="glass-card p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <h3 className="text-lg font-semibold text-indigo-700">
                {event.title}
              </h3>
              <p className="text-purple-600">
                Tickets Sold: {event.ticketsSold}
              </p>
              <p className="text-purple-600">
                Tickets Canceled: {event.ticketsCanceled}
              </p>
              <p className="text-purple-600">
                Total Revenue: £{(event.totalRevenue || 0).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
