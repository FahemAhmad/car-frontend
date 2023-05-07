import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../Components/Sidebar";
import TicketTable from "../Components/TicketsTable";
import { Column } from "ag-grid-community";
import UsersTable from "../Components/UsersTable";

function Dashboard({ handleLogout, lotteryNo }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newTicks, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [totalTickets, setTotalTickets] = useState(0);
  const [selectedTickets, setSelectedTickets] = useState(1);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    fetch("https://car-backend-hugg.onrender.com/api/tickets/tickets")
      .then((response) => response.json())
      .then((data) => {
        setStats(data);

        setTickets(data.tickets);
        console.log(newTicks);
      });
  }, []);

  function generateTickets() {
    if (totalTickets > 0 && totalTickets <= 100000) {
      fetch(
        "https://car-backend-hugg.onrender.com/api/tickets/create-lottery",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            totalTickets: totalTickets, // Replace with the total number of tickets you want to create
          }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message); // Successfully created lottery 1
          toast.success("New Lottery created");
          window.location.reload();
        })
        .catch((error) => {
          console.error(error);
          toast.error("Error starting lottry.");
        });
    }
  }

  return (
    <>
      <div className="dashboard-container">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          handleSidebarToggle={handleSidebarToggle}
          handleLogout={handleLogout}
          setSelectedTickets={setSelectedTickets}
        />
      </div>
      <div
        className={`content ${isSidebarOpen ? "open" : ""}`}
        style={{ height: "100%" }}
      >
        <p className="heading">
          {selectedTickets === 1 ? "Tickets Operations" : "Users"}
        </p>
        <hr />
        <div className="row" style={{ flexWrap: "wrap" }}>
          <button
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
            }}
            onClick={() => generateTickets()}
          >
            <h1>Generate new tickets</h1>
            <input
              type="number"
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "none",
                width: "30%",
                borderBottom: "1px solid white",
                height: 35,
              }}
              max={100000}
              min={1}
              value={totalTickets}
              onChange={(e) => setTotalTickets(e.target.value)}
            />
          </button>

          <button className="card">
            <p>Total Tickets Sold</p>
            <h1>{stats?.soldCount}</h1>
          </button>
          <button className="card">
            <p>Total Booked Tickets</p>
            <h1>{stats?.bookedCount}</h1>
          </button>
        </div>
        {selectedTickets === 1 && (
          <div className="row" style={{ height: "100%" }}>
            <TicketTable
              tickets={newTicks}
              lotteryNo={lotteryNo}
              setStats={setStats}
              stats={stats}
            />
          </div>
        )}
        {selectedTickets === 2 && (
          <div className="row">
            <UsersTable />
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
