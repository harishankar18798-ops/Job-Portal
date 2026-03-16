import { Request, Response } from "express";
import { EmploymentTypeService } from "../service/employmentTypeService";

export async function createEmploymentType(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const newEmploymentType = await EmploymentTypeService.createEmploymentType(name);
    res.status(201).json(newEmploymentType);
  } catch (error) {
    res.status(500).json({ error: "Failed to create Employment Type" });
  }
}

export async function getAllEmploymentTypes(req: Request, res: Response) {
  try {
    const employmentTypes = await EmploymentTypeService.getAllEmploymentTypes();
    res.status(200).json(employmentTypes);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve Employment Types" });
  }
}

export async function deleteEmploymentType(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    await EmploymentTypeService.deleteEmploymentType(numericId);

    res.status(200).json({ message: "Employment Type deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete Employment Type" });
  }
}

export async function updateEmploymentType(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const numericId = Number(id);

    const employmentType = await EmploymentTypeService.updateEmploymentType(
      numericId,
      name
    );

    res.status(200).json(employmentType);
  } catch (error) {
    res.status(500).json({ error: "Failed to update Employment Type" });
  }
}