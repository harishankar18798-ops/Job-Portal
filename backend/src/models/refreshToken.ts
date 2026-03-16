import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize";

import SequelizeConfig from "../db.config";

export class RefreshToken extends Model<
  InferAttributes<RefreshToken>,
  InferCreationAttributes<RefreshToken>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare jti: string;
  declare expiresAt: Date;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jti: {
      type: DataTypes.STRING(36),
      allowNull: false,
    },
    // accessToken: {               
    //   type: DataTypes.TEXT,
    //   allowNull: false,
    // },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize: SequelizeConfig,
    tableName: "refresh_tokens",
    timestamps: false,
  }
);