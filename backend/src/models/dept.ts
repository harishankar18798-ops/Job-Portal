import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize";

import SequelizeConfig from "../db.config";

export class Dept extends Model<
  InferAttributes<Dept>,
  InferCreationAttributes<Dept>
> {
  declare id: CreationOptional<number>;
  declare name: string;
}

Dept.init(
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
    tableName: "dept",
    timestamps: false,
  }
);
