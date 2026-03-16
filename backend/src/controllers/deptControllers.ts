import { Request, Response } from "express";
import { DeptService } from "../service/deptService";

export async function createDept(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const newDept = await DeptService.createDept(name);
    res.status(201).json(newDept);
  } catch (error) {
    res.status(500).json({ error: "Failed to create Dept" });
  }
}

export async function getAllDepts(req: Request, res: Response) {
  try {
    const depts = await DeptService.getAllDepts();
    res.status(200).json(depts);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve Depts" });
  }
}

export async function deleteDept(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const numericId = Number(id);
    await DeptService.deleteDept(numericId);
    res.status(200).json({ message: "Dept deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete Dept" });
  }
}

export async function updateDept(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const numericId = Number(id);
    const dept = await DeptService.updateDept(numericId, name);
    res.status(200).json(dept);
  } catch (error) {
    res.status(500).json({ error: "Failed to update Dept" });
  }
}