import { Dept } from "../models/dept";

export class DeptService {

  static async createDept(name: string) {
    return await Dept.create({ name });
  }

  static async getAllDepts() {
    return await Dept.findAll();
  }

  static async deleteDept(id: number) {
    return await Dept.destroy({ where: { id } });
  }

  static async updateDept(id: number, name: string) {
    const dept = await Dept.findByPk(id);
    if (dept) {
      dept.name = name;
      await dept.save();
    }
    return dept;
  }

}