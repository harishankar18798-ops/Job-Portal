import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize";

import SequelizeConfig from "../db.config";

export class Login extends Model<
  InferAttributes<Login>,
  InferCreationAttributes<Login>
> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare password: string;
  declare role: CreationOptional<string>;
  declare otp: CreationOptional<string | null>;
  declare otpExpiry: CreationOptional<Date | null>;
  declare isVerified: CreationOptional<boolean>;
  declare tokenVersion: CreationOptional<number>;
  // declare refreshToken: CreationOptional<string | null>;
  // declare refreshTokenExpiry: CreationOptional<Date | null>;
}

Login.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },

    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    tokenVersion: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },

    // refreshToken: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,
    // },

    // refreshTokenExpiry: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    // },

  },
  {
    sequelize: SequelizeConfig,
    tableName: "login",
    timestamps: false,
  }
);