import { Router } from "express";
import { createApplication, getApplication, getApplicationByCandidateId, updateApplicationStatus, getAIReport } from "../controllers/applicationsControllers";
import { verifyToken, authorize } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/createappl:
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateId
 *               - jobId
 *             properties:
 *               candidateId:
 *                 type: integer
 *               jobId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Application created successfully
 *       400:
 *         description: candidateId and jobId required
 *       500:
 *         description: Server error
 */
router.post("/createappl", createApplication);

/**
 * @swagger
 * /api/getappl:
 *   get:
 *     summary: Get all applications (admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all applications
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.get("/getappl", verifyToken, authorize(["admin"]), getApplication);

/**
 * @swagger
 * /api/getappcan/{candidateId}:
 *   get:
 *     summary: Get applications by candidate ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: List of applications for the candidate
 *       400:
 *         description: Invalid candidate id
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/getappcan/:candidateId", verifyToken, getApplicationByCandidateId);

/**
 * @swagger
 * /api/status/{id}:
 *   put:
 *     summary: Update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [applied, reviewed, shortlisted, rejected]
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       400:
 *         description: Invalid id or status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.put("/status/:id", verifyToken, updateApplicationStatus);

/**
 * @swagger
 * /api/applications/{id}/ai-report:
 *   get:
 *     summary: Get AI report for an application (admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Application ID
 *     responses:
 *       200:
 *         description: AI report generated successfully
 *       400:
 *         description: Invalid application id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.get("/applications/:id/ai-report", verifyToken, authorize(["admin"]), getAIReport);

export default router;