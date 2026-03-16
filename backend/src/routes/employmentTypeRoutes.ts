import { Router } from "express";
import {
  createEmploymentType,
  getAllEmploymentTypes,
  deleteEmploymentType,
  updateEmploymentType,
} from "../controllers/employmentTypeControllers";
import { verifyToken, authorize } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/create-employment-type:
 *   post:
 *     summary: Create a new employment type (admin only)
 *     tags: [EmploymentTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employment type created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.post("/create-employment-type", verifyToken, authorize(["admin"]), createEmploymentType);

/**
 * @swagger
 * /api/employment-types:
 *   get:
 *     summary: Get all employment types
 *     tags: [EmploymentTypes]
 *     responses:
 *       200:
 *         description: List of all employment types
 *       500:
 *         description: Server error
 */
router.get("/employment-types", getAllEmploymentTypes);

/**
 * @swagger
 * /api/employment-type/{id}:
 *   delete:
 *     summary: Delete an employment type (admin only)
 *     tags: [EmploymentTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employment Type ID
 *     responses:
 *       200:
 *         description: Employment type deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.delete("/employment-type/:id", verifyToken, authorize(["admin"]), deleteEmploymentType);

/**
 * @swagger
 * /api/employment-type/{id}:
 *   put:
 *     summary: Update an employment type (admin only)
 *     tags: [EmploymentTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employment Type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employment type updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.put("/employment-type/:id", verifyToken, authorize(["admin"]), updateEmploymentType);

export default router;