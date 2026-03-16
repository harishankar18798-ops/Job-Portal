import { Router } from "express";
import {
  createJob,
  getAllJobs,
  deleteJob,
  updateJob,
  generateJD,
} from "../controllers/jobControllers";
import { verifyToken, authorize } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/createjob:
 *   post:
 *     summary: Create a new job (admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - deptId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deptId:
 *                 type: integer
 *               minExperience:
 *                 type: number
 *               maxExperience:
 *                 type: number
 *               skillsRequired:
 *                 type: string
 *               employmentTypeId:
 *                 type: integer
 *               educationRequired:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.post("/createjob", verifyToken, authorize(["admin"]), createJob);

/**
 * @swagger
 * /api/getjob:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of all jobs
 *       500:
 *         description: Server error
 */
router.get("/getjob", getAllJobs);

/**
 * @swagger
 * /api/deletejob/{id}:
 *   delete:
 *     summary: Delete a job (admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.delete("/deletejob/:id", verifyToken, authorize(["admin"]), deleteJob);

/**
 * @swagger
 * /api/updatejob/{id}:
 *   put:
 *     summary: Update a job (admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deptId:
 *                 type: integer
 *               minExperience:
 *                 type: number
 *               maxExperience:
 *                 type: number
 *               skillsRequired:
 *                 type: string
 *               employmentTypeId:
 *                 type: integer
 *               educationRequired:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.put("/updatejob/:id", verifyToken, authorize(["admin"]), updateJob);

/**
 * @swagger
 * /api/ai/generate-jd:
 *   post:
 *     summary: Generate a job description using AI (admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               skillsRequired:
 *                 type: string
 *               minExperience:
 *                 type: number
 *               maxExperience:
 *                 type: number
 *               employmentTypeId:
 *                 type: integer
 *               educationRequired:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job description generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.post("/ai/generate-jd", verifyToken, authorize(["admin"]), generateJD);

export default router;