require("dotenv").config();
const compression = require("compression")
const express = require("express");
const cors = require("cors");
const credentials = require("./middleware/credentials");
const { verifyJwt,verifyMerchant } = require("./middleware/auth");
const cookieParser = require( "cookie-parser" );
const {swaggerSpec,swaggerUi} = require('./utils/swagger')

const PORT = process.env.PORT || 3500;
const app = express();

app.use(compression());

// Middlewares
app.use(credentials);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", swaggerUi.serve,swaggerUi.setup(swaggerSpec));
app.use("/waitlist", require("./routes/waitlist"));
app.use("/refresh", require("./routes/refresh"));
app.use("/auth", require("./routes/auth"));
app.use( "/logout", require( "./routes/logout" ) );
app.use("/verify-mail", require("./routes/verify"));
app.use("/product", require("./routes/product"));


// Routes which requires authorization
app.use( verifyJwt );


app.use(verifyMerchant)
app.use('/merchant/product', require("./routes/merchant"))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
