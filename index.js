const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Reservation = require('./models/reservation'); // Adjust the path as per your project structure

const app = express();

mongoose.connect("mongodb+srv://businesriteshrimal:sa6tTX5rYcFPEpnQ@ritesh.62l1wcx.mongodb.net/?retryWrites=true&w=majority&appName=ritesh");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/reserve', async (req, res) => {
    const { date } = req.query;
    let bookings = [];
    let conflictingReservation = false; // Initialize conflictingReservation flag

    if (date) {
        bookings = await Reservation.find({
            startTime: {
                $gte: new Date(date + 'T00:00:00'),
                $lt: new Date(date + 'T23:59:59')
            }
        });
    }

    // Check if there's a conflicting reservation
    if (bookings.length > 0) {
        conflictingReservation = true;
    }

    res.render('reserve', { message: '', date, bookings, conflictingReservation });
});

app.post('/reserve', async (req, res) => {
    const { name, email, phone, date, startTime } = req.body;

    const startDateTimeString = `${date}T${startTime}:00`;
    const startDateTime = new Date(startDateTimeString);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // One hour later

    // Check if the selected time slot is already booked
    const existingReservation = await Reservation.findOne({
        startTime: {
            $lt: endDateTime,
            $gte: startDateTime
        }
    });

    if (existingReservation) {
        // If there's a conflict, render the page with a message
        const bookings = await Reservation.find({
            startTime: {
                $gte: new Date(date + 'T00:00:00'),
                $lt: new Date(date + 'T23:59:59')
            }
        });

        return res.render('reserve', {
            message: 'This time slot is already reserved!',
            date,
            bookings,
            conflictingReservation: true  // Flag to show existing reservations table
        });
    }

    // Save the reservation
    const newReservation = new Reservation({
        name,
        email,
        phone,
        startTime: startDateTime,
        endTime: endDateTime
    });

    await newReservation.save();

    // Redirect to / with success message
    res.redirect('/?success=true');
});


// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
