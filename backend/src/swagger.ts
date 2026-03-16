import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Portal API',
      version: '1.0.0',
      description: 'Job Portal API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './src/routes/loginRoutes.ts',
    './src/routes/deptRoutes.ts',
    './src/routes/jobRoutes.ts',
    './src/routes/candidateRoutes.ts',
    './src/routes/applicationsRoutes.ts',
    './src/routes/employmentTypeRoutes.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);