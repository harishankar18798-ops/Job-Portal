import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize";

import SequelizeConfig from "../db.config";
import { Dept } from "./dept";
import { EmploymentType } from "./employmentType";

export class Job extends Model<
  InferAttributes<Job>,
  InferCreationAttributes<Job>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: string;
  declare deptId: number;
  declare employmentTypeId: CreationOptional<number | null>;

  declare minExperience: CreationOptional<number>;
  declare maxExperience: CreationOptional<number>;
  declare skillsRequired: CreationOptional<string>;
  declare educationRequired: CreationOptional<string>;
}

Job.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    deptId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Dept,
        key: "id",
      },
      field: "dept_id",
    },

    employmentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: EmploymentType,
        key: "id",
      },
      field: "employment_type_id",
    },

    minExperience: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "min_experience",
    },

    maxExperience: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "max_experience",
    },

    skillsRequired: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "skills_required",
    },

    educationRequired: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "education_required",
    },
  },
  {
    sequelize: SequelizeConfig,
    tableName: "job",
    timestamps: false,
  }
);

Job.belongsTo(Dept, { foreignKey: "deptId", as: "dept" });
Job.belongsTo(EmploymentType, {
  foreignKey: "employmentTypeId",
  as: "employmentType",
});