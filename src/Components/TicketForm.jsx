import { useEffect, useMemo, useState } from "react";
import ReactPaginate from "react-paginate";
import ReactFlagsSelect from "react-flags-select";
import { BsSearch } from "react-icons/bs";
import { AiOutlineDelete } from "react-icons/ai";
import "./ticket.css";
import { PropagateLoader, ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function sendWhatsAppMessage(phoneNumber, message) {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;
  window.open(url, "_blank");
}

function TicketForm({ tickets, loading, lotteryNo, setTickets }) {
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);

  const [itemOffset, setItemOffset] = useState(0);
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumberCountryCode, setPhoneNumberCountryCode] = useState("MX");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = {};

    if (selectedTickets.length === 0) {
      errors.ticket = "Please Select Tickets";
    }

    if (!phoneNumber) {
      errors.phoneNumber = "Por favor ingrese su número de teléfono";
    } else if (isNaN(phoneNumber)) {
      errors.phoneNumber = "El número de teléfono debe ser un número";
    }

    if (!fullName) {
      errors.fullName = "Por favor ingrese su nombre completo";
    }

    if (!state) {
      errors.state = "Por favor ingrese su estado";
    }

    if (!city) {
      errors.city = "Por favor ingrese su ciudad";
    }

    if (!email) {
      errors.email = "Por favor ingrese su correo electrónico";
    } else if (!/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i.test(email)) {
      errors.email = "Por favor ingrese un correo electrónico válido";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
    } else {
      // submit the form data
      console.log({
        phoneNumber,
        fullName,
        state,
        city,
        email,
      });

      let mobNumber =
        phoneNumberCountryCode === "MX"
          ? `+52 ${phoneNumber}`
          : `+1 ${phoneNumber}`;
      try {
        setBtnLoading(true);
        const response = await fetch(
          `https://car-backend-hugg.onrender.com/api/tickets/sell-tickets/${lotteryNo}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ticketNumbers: selectedTickets,
              userInformation: {
                fullName: fullName,
                email: email,
                state: state,
                city: city,
                phoneNumber: mobNumber,
              },
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message);
        } else {
          const newTickets = tickets.filter(
            (ticket) => !selectedTickets.includes(ticket)
          );
          setTickets(newTickets);

          toast.success("Tickets Vendidos Exitosamente!");
          sendWhatsAppMessage(
            "526442340445",
            `Hello,
            I would like to reserve the following lottery tickets: ${selectedTickets.join(
              ", "
            )} for lottery number ${lotteryNo}.
            The name is: ${fullName}.
            I am located in: ${city}, ${state} and my phone number is: ${mobNumber}.
            My email address is: ${email}.
            Thank you.`
          );
        }

        // clear the form data
        setPhoneNumber("");
        setFullName("");
        setState("");
        setCity("");
        setEmail("");
        setSelectedTickets([]);

        // clear the errors
        setErrors({});
      } catch (error) {
        setErrors({ submit: error.message });
        setBtnLoading(false);
      }

      setBtnLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Update individual state variables instead of formData
    switch (name) {
      case "phoneNumber":
        setPhoneNumber(value);
        break;
      case "fullName":
        setFullName(value);
        break;
      case "state":
        setState(value);
        break;
      case "city":
        setCity(value);
        break;
      case "email":
        setEmail(value);
        break;
      default:
        break;
    }

    // Remove error if user has fixed it
    if (errors.hasOwnProperty(name)) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };
  let itemsPerPage = 5000;

  useEffect(() => {
    if (Array.isArray(tickets)) {
      const endOffset = itemOffset + itemsPerPage;
      const filteredTickets = tickets.filter((ticket) =>
        ticket.includes(searchQuery)
      );
      const items = filteredTickets.slice(itemOffset, endOffset);
      setCurrentItems(items);
      setPageCount(Math.ceil(filteredTickets.length / itemsPerPage));
    } else {
      tickets.then((data) => {
        const endOffset = itemOffset + itemsPerPage;
        const filteredTickets = data.filter((ticket) =>
          ticket.includes(searchQuery)
        );
        const items = filteredTickets.slice(itemOffset, endOffset);
        setCurrentItems(items);
        setPageCount(Math.ceil(filteredTickets.length / itemsPerPage));
      });
    }
  }, [tickets, itemOffset, itemsPerPage, searchQuery]);

  const handlePageClick = ({ selected }) => {
    const offset = selected * itemsPerPage;
    setItemOffset(offset);
  };

  useEffect(() => {
    if (selectedTickets.length > 0) {
      const newErrors = { ...errors };
      delete newErrors["ticket"];
      setErrors(newErrors);
    }
  }, [selectedTickets]);

  return (
    <>
      {Object.keys(errors).length !== 0 && (
        <div className="error-box">
          {Object.keys(errors).length > 0 && (
            <span className="error">{Object.values(errors)[0]}</span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="col flex-start">
          {/* Country code and number */}
          <label>Numero de telefono</label>
          <div className="form-row">
            <ReactFlagsSelect
              selected={phoneNumberCountryCode}
              onSelect={(code) => setPhoneNumberCountryCode(code)}
              countries={["MX", "US"]}
            ></ReactFlagsSelect>
            <input
              type="number"
              name="phoneNumber"
              placeholder="Numero de telefono"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value;
                setPhoneNumber(value);
                // Remove error if user has fixed it
                if (errors.hasOwnProperty("phoneNumber")) {
                  const newErrors = { ...errors };
                  delete newErrors["phoneNumber"];
                  setErrors(newErrors);
                }
              }}
            />
          </div>

          {/* Full field */}
          <label>Nombre y apellidos</label>
          <div className="form-row">
            <input
              type="text"
              name="fullName"
              placeholder="Ingrese su nombre completo"
              value={fullName}
              onChange={(e) => {
                const value = e.target.value;
                setFullName(value);
                // Remove error if user has fixed it
                if (errors.hasOwnProperty("fullName")) {
                  const newErrors = { ...errors };
                  delete newErrors["fullName"];
                  setErrors(newErrors);
                }
              }}
            />
          </div>

          {/* 2 half fields */}
          <div className="col-half">
            <div className="row-half">
              <label>Estado</label>
              <div className="form-row">
                <input
                  type="text"
                  name="state"
                  placeholder="Estado"
                  value={state}
                  onChange={(e) => {
                    const value = e.target.value;
                    setState(value);
                    // Remove error if user has fixed it
                    if (errors.hasOwnProperty("state")) {
                      const newErrors = { ...errors };
                      delete newErrors["state"];
                      setErrors(newErrors);
                    }
                  }}
                />
              </div>
            </div>
            <div className="row-half">
              <label>Ciudad</label>
              <div className="form-row">
                <input
                  type="text"
                  name="city"
                  placeholder="Municipalidad"
                  value={city}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCity(value);
                    // Remove error if user has fixed it
                    if (errors.hasOwnProperty("city")) {
                      const newErrors = { ...errors };
                      delete newErrors["city"];
                      setErrors(newErrors);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Full email field */}
          <label>Emailiso</label>
          <div className="form-row">
            <input
              type="text"
              name="email"
              placeholder="Emailisto"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                // Remove error if user has fixed it
                if (errors.hasOwnProperty("email")) {
                  const newErrors = { ...errors };
                  delete newErrors["email"];
                  setErrors(newErrors);
                }
              }}
            />
          </div>

          <button className="select-ticket" type="submit">
            {btnLoading ? <ClipLoader color="white" /> : "Apartar boletos"}
          </button>
        </div>
      </form>

      <div className="search-bar selected-container">
        {selectedTickets.length > 0 &&
          selectedTickets.map((ticket, index) => (
            <div
              className="selected-ticket"
              onClick={() => {
                const updatedTickets = [...selectedTickets];
                updatedTickets.splice(index, 1);
                setSelectedTickets(updatedTickets);
              }}
            >
              {ticket} <AiOutlineDelete style={{ fontWeight: 900 }} />
            </div>
          ))}
      </div>
      {/* Search bar with button */}
      <div className="row search-bar">
        <input
          type="text"
          placeholder="Buscar tu boleto"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        {/* <button className="search-button" onClick={handleSearch}>
          <BsSearch />
          Buscar boleto
        </button> */}
      </div>

      {/* Show tickets */}

      {loading ? (
        <div
          style={{
            maxWidth: "1100px",
            margin: "50px auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <PropagateLoader color="orangered" />
        </div>
      ) : (
        <>
          <div className="display-tickets">
            {currentItems.map((ticket, index) => (
              <div
                key={ticket}
                className={`ticket ${
                  selectedTickets.includes(ticket) && "selected"
                }`}
                onClick={() =>
                  setSelectedTickets(() => {
                    if (selectedTickets.includes(ticket)) {
                      return selectedTickets;
                    } else return [...selectedTickets, ticket];
                  })
                }
              >
                {ticket}
              </div>
            ))}
          </div>

          <ReactPaginate
            breakLabel="..."
            nextLabel="next >"
            onPageChange={handlePageClick}
            pageCount={pageCount}
            previousLabel="< previous"
            renderOnZeroPageCount={null}
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakClassName="page-item"
            breakLinkClassName="page-link"
            containerClassName="pagination"
            activeClassName="active"
          />
        </>
      )}
    </>
  );
}

export default TicketForm;
