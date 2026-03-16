import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize";

import SequelizeConfig from "../db.config";

export class EmploymentType extends Model<
  InferAttributes<EmploymentType>,
  InferCreationAttributes<EmploymentType>
> {
  declare id: CreationOptional<number>;
  declare name: string;
}

EmploymentType.init(
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
  },
  {
    sequelize: SequelizeConfig,
    tableName: "employment_type",
    timestamps: false,
  }
);