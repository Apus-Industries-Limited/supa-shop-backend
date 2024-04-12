require("dotenv").config()
const express = require( 'express' );
const cors = require( 'cors' );
const credentials = require( "./middleware/credentials" );

const PORT = process.env.PORT || 3500
const app = express();


// Middlewares
app.use(credentials)
app.use( cors() );
app.use( express.json() )
app.use( express.urlencoded( { extended: false } ) )


app.use( '/waitlist', require( './routes/waitlist' ) )
app.use('/verify-mail', require('./routes/verify'))






app.listen(PORT,()=> console.log(`Server running on port ${PORT}`))