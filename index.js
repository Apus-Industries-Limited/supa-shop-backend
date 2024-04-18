require("dotenv").config()
const express = require( 'express' );
const cors = require( 'cors' );
const credentials = require( "./middleware/credentials" );
const verifyJwt = require( "./middleware/verifyJWT" )
const cookieParser = require( 'cookie-parser' )
const swaggerJsdoc = require( "swagger-jsdoc" )
const swaggerUi = require("swagger-ui-express")

const PORT = process.env.PORT || 3500;
const app = express();

// Middlewares
app.use(credentials);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use( '/waitlist', require( './routes/waitlist' ) )
app.use('/refresh',require("./routes/refresh"))
app.use( '/auth', require( "./routes/auth" ) )
app.use('/logout', require('./routes/logout'))
app.use( '/verify-mail', require( './routes/verify' ) )


// Routes which requires authorization
// app.use(verifyJwt);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));