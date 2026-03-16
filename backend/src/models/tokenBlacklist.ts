import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize";
import SequelizeConfig from "../db.config";

export class TokenBlacklist extends Model<
  InferAttributes<TokenBlacklist>,
  InferCreationAttributes<TokenBlacklist>
> {
  declare id: CreationOptional<number>;
  declare jti: string;
  declare expiresAt: Date;
}

TokenBlacklist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jti: {
      type: DataTypes.STRING(36),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize: SequelizeConfig,
    tableName: "token_blacklist",
    timestamps: false,
  }
);