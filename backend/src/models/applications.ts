import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize";

import SequelizeConfig from "../db.config";
import { Candidate } from "./candidate";
import { Job } from "./job";

export class Application extends Model<
  InferAttributes<Application>,
  InferCreationAttributes<Application>
> {
  declare id: CreationOptional<number>;
  declare candidateId: number;
  declare jobId: number;
  declare status: string;
  declare aiReport: CreationOptional<object | null>;
}

Application.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    candidateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "candidate_id",
      references: {
        model: Candidate,
        key: "id",
      },
    },

    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "job_id",
      references: {
        model: Job,
        key: "id",
      },
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "applied",
    },
    aiReport: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "ai_report",
    },
  },
  {
    sequelize: SequelizeConfig,
    tableName: "applications",
    timestamps: false,
  }
);

Application.belongsTo(Candidate, {
  foreignKey: "candidateId",
  as: "candidate",
});

Application.belongsTo(Job, {
  foreignKey: "jobId",
  as: "job",
});