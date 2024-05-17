require("dotenv").config();
const compression = require("compression")
const express = require("express");
const cors = require("cors");
const credentials = require("./middleware/credentials");
const { verifyJwt,verifyMerchant } = require("./middleware/auth");
const cookieParser = require( "cookie-parser" );
const { swaggerSpec, swaggerUi } = require( './utils/swagger' )
const figlet = require('figlet');
const multer = require( 'multer' );

const PORT = process.env.PORT || 3500;
const app = express();

app.use(compression());

// Middlewares
app.use(credentials);
app.use( cors() );
const storage = multer.diskStorage( {
      destination: './public/images',
      filename: ( req,file, cb )=>{
            cb( null, file.originalname );
      }
} )
const upload = multer({storage})
const cp = upload.fields([{name:'dp',maxCount:1}, {name:'images',maxCount:3}])
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use( cookieParser() );

app.use(express.static("public"))

app.use("/docs", swaggerUi.serve,swaggerUi.setup(swaggerSpec));
app.use("/waitlist", require("./routes/waitlist"));
app.use("/refresh", require("./routes/refresh"));
app.use("/auth", require("./routes/auth"));
app.use( "/logout", require( "./routes/logout" ) );
app.use("/verify-mail", require("./routes/verify"));
app.use("/product", require("./routes/product"));


// Routes which requires authorization
app.use( verifyJwt );


app.use(verifyMerchant)
app.use('/merchant/product',cp, require("./routes/merchant"))



app.listen( PORT, () =>
{
  figlet.text('SupaShop API 1.0', {
    font: 'Doom',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true
  }, (err, asciiArt) => {
    if (err) {
      console.error(err);
      return;
    }
      console.log( asciiArt );
      console.log( `server is running on port ${ PORT }` );
  } );
      
});
