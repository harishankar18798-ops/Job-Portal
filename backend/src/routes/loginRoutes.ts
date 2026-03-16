import {Router} from 'express';
import {createClogin, getAllClogin, loginClogin,
        sendOtp, verifyOtp, signup, updateRole, createEmployeeLogin,
        refreshToken, logout, logoutAll, createGuestLogin, msalLoginController} from '../controllers/loginController';
import { verifyToken, authorize } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/createlogin:
 *   post:
 *     summary: Create a new login account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Login account created successfully
 *       500:
 *         description: Server error
 */
router.post('/createlogin', createClogin);

/**
 * @swagger
 * /api/guest-login:
 *   post:
 *     summary: Create a guest login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Guest login created successfully
 *       500:
 *         description: Server error
 */
router.post('/guest-login', createGuestLogin);

/**
 * @swagger
 * /api/getlogin:
 *   get:
 *     summary: Get all login accounts (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all login accounts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Server error
 */
router.get('/getlogin', verifyToken, authorize(["admin"]), getAllClogin);

/**
 * @swagger
 * /api/loginlogin:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post('/loginlogin', loginClogin);

/**
 * @swagger
 * /api/send-otp:
 *   post:
 *     summary: Send OTP to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad request
 */
router.post('/send-otp', sendOtp);

/**
 * @swagger
 * /api/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post('/verify-otp', verifyOtp);

/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Sign up with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signup successful
 *       400:
 *         description: Bad request
 */
router.post('/signup', signup);

/**
 * @swagger
 * /api/role/{id}:
 *   put:
 *     summary: Update user role (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Login ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user, guest]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       400:
 *         description: Bad request
 */
router.put("/role/:id", verifyToken, authorize(["admin"]), updateRole);

/**
 * @swagger
 * /api/refresh:
 *   post:
 *     summary: Refresh access token using cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token returned
 *       401:
 *         description: No refresh token or invalid token
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout current session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Server error
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/logout-all', verifyToken, logoutAll);

/**
 * @swagger
 * /api/msal-login:
 *   post:
 *     summary: Login with Microsoft Azure token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - azureToken
 *             properties:
 *               azureToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Azure token required
 *       401:
 *         description: Unauthorized
 */
router.post('/msal-login', msalLoginController);

/**
 * @swagger
 * /api/create-emplogin:
 *   post:
 *     summary: Create an employee login account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       201:
 *         description: Employee login created successfully
 *       400:
 *         description: Bad request
 */
router.post('/create-emplogin', createEmployeeLogin);

export default router;