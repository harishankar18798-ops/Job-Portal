import { SequelizeConfig } from "./db.config";
import "./models/dept";
import "./models/job";
import "./models/candidate";
import "./models/login";
import "./models/applications";
import "./models/refreshToken";
import "./models/tokenBlacklist";
import "./models/employmentType";
import express from "express";
import deptRoutes from "./routes/deptRoutes";
import jobRoutes from "./routes/jobRoutes";
import candidateRoutes from "./routes/candidateRoutes";
import loginRoutes from "./routes/loginRoutes";
import applicationsRoutes from "./routes/applicationsRoutes";
import employmentTypeRoutes from "./routes/employmentTypeRoutes";
import cors from "cors";
import path from "path";
import cookieParser from 'cookie-parser';
import { Op } from "sequelize";                           
import { TokenBlacklist } from "./models/tokenBlacklist"; 
import { RefreshToken } from "./models/refreshToken";
import cron from 'node-cron';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
//app.use(cors());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", loginRoutes);

const uploadPath = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadPath));

app.use("/api", deptRoutes);
app.use("/api", jobRoutes);
app.use("/api", candidateRoutes);
app.use("/api", applicationsRoutes);
app.use("/api", employmentTypeRoutes);

cron.schedule('*/30 * * * *', async () => {
  try {
    await TokenBlacklist.destroy({
      where: { expiresAt: { [Op.lt]: new Date() } }
    });
    await RefreshToken.destroy({
      where: { expiresAt: { [Op.lt]: new Date() } }
    });
    console.log("cleaned expired tokens:", new Date().toISOString());
  } catch (error) {
    console.error("cleanup failed:", error);
  }
});

export async function initializeDatabase() {
  try {
    await SequelizeConfig.authenticate();
    console.log("Database connection has been established successfully.");

    await SequelizeConfig.sync({ alter: true });
    console.log("All models were synchronized successfully.");

  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();