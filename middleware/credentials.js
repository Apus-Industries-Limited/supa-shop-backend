const allowedOrigin = require( "../config/allowedOrigins" );

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigin.includes(origin)) {
    res.header( "Access-Control-Allow-Credentials", true );
    res.header('Access-Control-Allow-Origin', "*")
  }
  next();
};

module.exports = credentials;
