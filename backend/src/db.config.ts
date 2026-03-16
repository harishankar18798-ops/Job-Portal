import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const SequelizeConfig = new Sequelize(
  process.env.DB_NAME || "job_db",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "root",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    dialect: "postgres",
    logging: false,

    pool: {
      max: 20,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },

    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

export default SequelizeConfig;