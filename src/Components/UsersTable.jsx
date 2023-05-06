import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";

function UsersTable() {
  const [rowData, setRowData] = useState([]);

  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const columnsDef = [
    {
      headerName: "User",
      children: [
        {
          field: "user.fullName",
          headerName: "Full Name",
          sortable: true,
          flex: 1,
        },
        {
          field: "user.email",
          headerName: "Email",
          sortable: true,
          flex: 1,
        },
        {
          field: "user.phoneNumber",
          headerName: "Phone Number",
          sortable: true,
          flex: 1,
        },
        {
          field: "user.state",
          headerName: "State",
          sortable: true,
          flex: 1,
        },
        {
          field: "user.city",
          headerName: "City",
          sortable: true,
          flex: 1,
        },
      ],
    },
    {
      headerName: "Booked Tickets",
      field: "bookedTickets",
      sortable: true,
      flex: 1,
      valueGetter: (params) => {
        return params.data.bookedTickets
          .map((ticket) => ticket.ticketNumbers.join(", "))
          .join("\n");
      },
    },
    {
      headerName: "Sold Tickets",
      field: "soldTickets",
      sortable: true,
      flex: 1,
      valueGetter: (params) => {
        return params.data.soldTickets
          .map((ticket) => ticket.ticketNumber)
          .join(", ");
      },
    },
  ];

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onQuickFilterChanged = () => {
    gridApi.setQuickFilter(document.getElementById("quickFilter").value);
  };

  useEffect(() => {
    const getUsers = async () => {
      fetch("http://localhost:5000/api/users/latest-lottery")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setRowData(data); // do something with the response data
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    };

    getUsers();
  }, []);
  return (
    <div style={{ width: "100%", marginTop: 20 }}>
      <input
        type="text"
        id="quickFilter"
        placeholder="Search..."
        onChange={onQuickFilterChanged}
        style={{ backgroundColor: "black", color: "white", border: "none" }}
      />
      <div className="ag-theme-alpine-dark">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnsDef}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={10}
          rowSelection={"single"}
          editType={"fullRow"}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
}

export default UsersTable;
