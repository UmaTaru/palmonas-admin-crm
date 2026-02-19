import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Palmonas Admin CRM API",
      version: "1.0.0",
      description: "Admin CRM for multi-channel order management",
    },

    servers: [
      {
        url: "http://localhost:4000",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/modules/**/*.ts", "./src/routes/**/*.ts"],
});
