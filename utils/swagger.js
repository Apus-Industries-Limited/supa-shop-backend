// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Basic metadata about the API
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Supashop API with Swagger',
    version: '1.0.0',
    description: 'Supa shop Api docummentaion to aid connection with frontend',
  },
  servers: [
    {
      url: 'http://localhost:3500',
      description: 'Development server',
    },
    {
      url: "https://supa-shop-backend.onrender.com",
      description:"Production server"
    }
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ['./controllers/*.js'], // Files with API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
