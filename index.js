require("dotenv").config()
const express = require( 'express' );
const cors = require( 'cors' );
const credentials = require( "./middleware/credentials" );
const verifyJwt = require( "./middleware/verifyJWT" )
const orderRoutes = require('./orderRoutes');
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 3500
const app = express();


// Middlewares
app.use(credentials)
app.use( cors() );
app.use( express.json() )
app.use( express.urlencoded( { extended: false } ) )
app.use( cookieParser() )


app.use( '/waitlist', require( './routes/waitlist' ) )
app.use('/auth', require("./routes/auth"))
app.use( '/verify-mail', require( './routes/verify' ) )


// Routes which requires authorization
app.use(verifyJwt)

// app.js

app.use(express.json()); // Middleware to parse JSON request bodies

//Use the order routes
app.use('/api', orderRoutes);

app.listen(PORT, () => {
    console.log('Server is running on port ${PORT}');
});






app.listen(PORT,()=> console.log(`Server running on port ${PORT}`))