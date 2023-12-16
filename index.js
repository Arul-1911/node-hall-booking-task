const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 4000;

app.use(bodyParser.json());

let rooms = [
  {
    roomId: "R1",
    seatsAvailable: "50",
    amenities: ["AC", "wifi", "projector"],
    pricePerHour: 2000,
  },
  {
    roomId: "R2",
    seatsAvailable: "150",
    amenities: ["AC", "wifi", "projector", "Snacks"],
    pricePerHour: 12000,
  },
];

let bookings = [
  {
    customer: "Arul",
    bookingDate: "Wed Jul 28 2023",
    startTime: "10AM",
    endTime: "12PM",
    bookingId: "B1",
    roomId: "R1",
    status: "booked",
    booked_on: "Wed Jul 18 2023",
  },
  {
    customer: "praveen",
    bookingDate: "Wed Jul 18 2023",
    startTime: "10AM",
    endTime: "12PM",
    bookingId: "B2",
    roomId: "R2",
    status: "booked",
    booked_on: "Mon Jun 18 2023",
  },
];

let customers = [
  {
    name: "Arul",
    bookings: [
      {
        customer: "Arul",
        bookingDate: "Wed Jul 28 2023",
        startTime: "10AM",
        endTime: "12PM",
        bookingId: "B1",
        roomId: "R1",
        status: "booked",
        booked_on: "Wed Jul 18 2023",
      },
    ],
  },
  {
    name: "praveen",
    bookings: [
      {
        customer: "praveen",
        bookingDate: "Wed Jul 18 2023",
        startTime: "10AM",
        endTime: "12PM",
        bookingId: "B2",
        roomId: "R2",
        status: "booked",
        booked_on: "Mon Jun 18 2023",
      },
    ],
  },
];

//view all rooms

app.get("/rooms/all", function (req, res) {
  res.status(200).json({ RoomsList: rooms });
});

//creating a room

app.post("/rooms/create", function (req, res) {
  const room = req.body;
  const idExists = rooms.find((e) => e.roomId === room.roomId);
  if (idExists !== undefined) {
    return res.status(400).json({ message: `Room already exists` });
  } else {
    rooms.push(room);
    res.status(200).json({ message: `Room Created Successfully` });
  }
});

//for booking a room

app.post("/booking/create/:id", function (req, res) {
  try {
    const { id } = req.params;
    let bookRoom = req.body;
    let dateFormat = new Date().toDateString();
    let idExists = rooms.find((e) => e.roomId === id);
    if (idExists === undefined) {
      return res
        .status(400)
        .json({ message: `Room does not exist`, RoomsList: rooms });
    }

    // verifying the booked data

    let matchId = bookings.filter((b) => b.roomId === id);
    if (matchId.length > 0) {
      let datecheck = matchId.filter((m) => {
        return m.bookingDate === bookRoom.bookingDate;
      });

      if (datecheck.length === 0) {
        let newId = "B" + (bookings.length + 1);
        let newBooking = {
          ...bookRoom,
          bookingId: newId,
          roomId: id,
          status: "booked",
          booked_on: dateFormat,
        };
        bookings.push(newBooking);
        return res.status(200).json({
          message: `Hall booked Sucessfully`,
          Bookings: bookings,
          Added: newBooking,
        });
      } else {
        return res.status(400).json({
          message: `Hall already booked , choose another one`,
          Bookings: bookings,
        });
      }
    } else {
      let newId = "B" + (bookings.length + 1);
      let newBooking = {
        ...bookRoom,
        bookingId: newId,
        roomId: id,
        status: "booked",
        booked_on: dateFormat,
      };
      bookings.push(newBooking);

      const customerdetails = customers.find(
        (customer) => customer.name === newBooking.customer
      );

      if (customerdetails) {
        customerdetails.bookings.push(newBooking);
      } else {
        customers.push({ name: newBooking.customer, bookings: [newBooking] });
      }

      return res.status(200).json({
        message: "Hall booked",
        Bookings: bookings,
        added: newBooking,
      });
    }
  } catch (error) {
    res.status(400).json({ error: `Error in booking room` });
  }
});

//view all the booked rooms

app.get("/viewbooked", (req, res) => {
  const bookedRooms = bookings.map((booking) => {
    const { roomId, status, customer, bookingDate, startTime, endTime } =
      booking;
    return { roomId, status, customer, bookingDate, startTime, endTime };
  });

  res.status(200).json(bookedRooms);
});

// view customers with booked data

app.get("/customers", (req, res) => {
  const customerbookings = customers.map((customer) => {
    const { name, bookings } = customer;
    const customerDetails = bookings.map((booking) => {
      const { roomId, status, bookingDate, startTime, endTime } = booking;
      return { name, status, roomId, bookingDate, startTime, endTime };
    });

    return customerDetails;
  });

  // Flatten the array of arrays into a single array
  const flattenedCustomerBookings = [].concat(...customerbookings);

  res.json(flattenedCustomerBookings);
});

//how many times user booked the room

app.get("/customer/:name", (req, res) => {
  const { name } = req.params;
  const customer = customers.find((cust) => cust.name === name);
  if (!customer) {
    res.status(404).json({ error: `Customer not found` });
    return;
  }

  const customerbooked = customer.bookings.map((booking) => {
    const {
      customer,
      roomId,
      startTime,
      endTime,
      bookingId,
      status,
      bookingDate,
      booked_on,
    } = booking;
    return {
      customer,
      roomId,
      startTime,
      endTime,
      bookingId,
      status,
      bookingDate,
      booked_on,
    };
  });

  return res.json(customerbooked);
});

// Port listening
app.listen(PORT, () => {
  console.log(`Port started in ${PORT}`);
});
