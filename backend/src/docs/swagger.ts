import { Express } from "express";

/**
 * Swagger/OpenAPI configuration
 * Provides API documentation endpoint at /api-docs
 */
export function setupSwagger(app: Express): void {
  try {
    // Dynamically import to avoid type errors if swagger-jsdoc is not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const swaggerJSDoc = require("swagger-jsdoc");

    const swaggerOptions = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "SecureDocs AI API",
          version: "1.0.0",
          description:
            "Automated fraud detection and document analysis platform",
          contact: {
            name: "SecureDocs AI",
          },
        },
        servers: [
          {
            url: "http://localhost:3000/api",
            description: "Development server",
          },
        ],
      },
      apis: ["./src/routes/**/*.ts"],
    };

    const swaggerSpec = swaggerJSDoc(swaggerOptions);

    // Serve OpenAPI spec as JSON
    app.get("/api-docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    // When swagger-ui-express is installed, use this endpoint:
    // import swaggerUi from "swagger-ui-express";
    // app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    console.log("✓ Swagger documentation available at /api-docs.json");
  } catch (error) {
    console.warn(
      "⚠ Swagger-jsdoc not available. Skipping API documentation setup.",
    );
    // Continue without Swagger - this is optional
  }
}
