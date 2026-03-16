import { EmploymentType } from "../models/employmentType";

export class EmploymentTypeService {

  static async createEmploymentType(name: string) {
    return await EmploymentType.create({ name });
  }

  static async getAllEmploymentTypes() {
    return await EmploymentType.findAll();
  }

  static async deleteEmploymentType(id: number) {
    return await EmploymentType.destroy({ where: { id } });
  }

  static async updateEmploymentType(id: number, name: string) {
    const employmentType = await EmploymentType.findByPk(id);

    if (employmentType) {
      employmentType.name = name;
      await employmentType.save();
    }

    return employmentType;
  }

}