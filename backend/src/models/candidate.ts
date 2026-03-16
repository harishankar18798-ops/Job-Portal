import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize";

import SequelizeConfig from "../db.config";
import { Login } from "./login";

export class Candidate extends Model<
  InferAttributes<Candidate>,
  InferCreationAttributes<Candidate>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare resume: string;
  declare loginId: CreationOptional<number | null>;

  declare skills: CreationOptional<string>;
  declare totalExperience: CreationOptional<number>;
  declare dateOfBirth: CreationOptional<Date>;

  declare educationDetails: CreationOptional<object>;
  declare experienceDetails: CreationOptional<object>;
  declare resumeText: CreationOptional<string>;
}

Candidate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    resume: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    skills: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    totalExperience: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "total_experience",
    },

    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "date_of_birth",
    },

    experienceDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "experience_details",
    },

    educationDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "education_details",
    },

    resumeText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    loginId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "login_id",
      references: {
        model: Login,
        key: "id",
      },
    },
  },
  {
    sequelize: SequelizeConfig,
    tableName: "candidate",
    timestamps: false,
  }
);