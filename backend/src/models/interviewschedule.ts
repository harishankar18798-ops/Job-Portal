import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from "sequelize";
import SequelizeConfig from "../db.config";
import { Application } from "./applications";

export class InterviewSchedule extends Model<
  InferAttributes<InterviewSchedule>,
  InferCreationAttributes<InterviewSchedule>
> {
  declare id: CreationOptional<number>;
  declare applicationId: number;
  declare scheduledDate: string;
  declare scheduledTime: string;
  declare mode: "online" | "offline";
  declare meetLink: CreationOptional<string | null>;
  declare recruiterEmail: string;
  declare status: CreationOptional<string>;
}

InterviewSchedule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "application_id",
      references: {
        model: Application,
        key: "id",
      },
    },
    scheduledDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "scheduled_date",
    },
    scheduledTime: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "scheduled_time",
    },
    mode: {
      type: DataTypes.ENUM("online", "offline"),
      allowNull: false,
    },
    meetLink: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "meet_link",
    },
    recruiterEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "recruiter_email",
    },
    status: {
      type: DataTypes.ENUM("scheduled", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "scheduled",
    },
  },
  {
    sequelize: SequelizeConfig,
    tableName: "interview_schedules",
    timestamps: true,
  }
);

InterviewSchedule.belongsTo(Application, {
  foreignKey: "applicationId",
  as: "application",
});

Application.hasOne(InterviewSchedule, {
  foreignKey: "applicationId",
  as: "interviewSchedule",
});