import { Router } from "express";
import {
  createDept,
  getAllDepts,
  deleteDept,
  updateDept,
} from "../controllers/deptControllers";
import { verifyToken, authorize } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/createdept:
 *   post:
 *     summary: Create a new department (admin only)
 *     tags: [Departments]
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
 *         description: Department created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.post("/createdept", verifyToken, authorize(["admin"]), createDept);

/**
 * @swagger
 * /api/getdept:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: List of all departments
 *       500:
 *         description: Server error
 */
router.get("/getdept", getAllDepts);

/**
 * @swagger
 * /api/deletedept/{id}:
 *   delete:
 *     summary: Delete a department (admin only)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.delete("/deletedept/:id", verifyToken, authorize(["admin"]), deleteDept);

/**
 * @swagger
 * /api/updatedept/{id}:
 *   put:
 *     summary: Update a department (admin only)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
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
 *         description: Department updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.put("/updatedept/:id", verifyToken, authorize(["admin"]), updateDept);

export default router;