const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    startTime: { type: Date, unique: true },
    endTime: Date
});

module.exports = mongoose.model('Reservation', reservationSchema);
