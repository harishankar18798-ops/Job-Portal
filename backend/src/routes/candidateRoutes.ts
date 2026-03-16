import { Router } from "express";
import { createCandidate, getCandidate, getCandidateById, updateCandidate, parseResume } from "../controllers/candidateController";
import { upload } from "../middleware/upload";
import { verifyToken, authorize } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/apply:
 *   post:
 *     summary: Create a new candidate with resume upload
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - resume
 *               - loginId
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               loginId:
 *                 type: integer
 *               skills:
 *                 type: string
 *               totalExperience:
 *                 type: number
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               educationDetails:
 *                 type: string
 *                 description: JSON string of education details
 *               experienceDetails:
 *                 type: string
 *                 description: JSON string of experience details
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *       400:
 *         description: Resume required
 *       500:
 *         description: Server error
 */
router.post("/apply", upload.single("resume"), createCandidate);

/**
 * @swagger
 * /api/profile/{loginId}:
 *   get:
 *     summary: Get candidate by login ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loginId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Login ID of the candidate
 *     responses:
 *       200:
 *         description: Candidate profile retrieved successfully
 *       400:
 *         description: Invalid login id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.get("/profile/:loginId", verifyToken, getCandidate);

/**
 * @swagger
 * /api/idprofile/{id}:
 *   get:
 *     summary: Get candidate by candidate ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate profile retrieved successfully
 *       400:
 *         description: Invalid candidate id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.get("/idprofile/:id", verifyToken, getCandidateById);

/**
 * @swagger
 * /api/parse-resume:
 *   post:
 *     summary: Parse a resume file and extract fields
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Resume parsed successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Failed to parse resume
 */
router.post("/parse-resume", upload.single("resume"), parseResume);

/**
 * @swagger
 * /api/updateprofile/{id}:
 *   put:
 *     summary: Update candidate profile (user only)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               skills:
 *                 type: string
 *               totalExperience:
 *                 type: number
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               educationDetails:
 *                 type: string
 *                 description: JSON string of education details
 *               experienceDetails:
 *                 type: string
 *                 description: JSON string of experience details
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user only
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.put("/updateprofile/:id", upload.single("resume"), verifyToken, authorize(["user"]), updateCandidate);

export default router;