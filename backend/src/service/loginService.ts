import { Login } from '../models/login';
import bcrypt from 'bcrypt';
import { sendEmail } from "../utils/email";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from '../models/refreshToken';
import { TokenBlacklist } from '../models/tokenBlacklist';
import { verifyAzureToken } from '../utils/msalVerify';
import { randomBytes } from 'crypto';

export class loginService {

  static async createClogin(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await Login.create({ email, password: hashedPassword });
  }

  // static async getAllClogins() {
  //   return await Login.findAll();
  // }
  static async getAllClogins() {
    return await Login.findAll({
      where: {
        isVerified: true,
      },
    });
  }

  static async login(email: string, password: string) {
    const user = await Login.findOne({ where: { email } });
    if (!user || !user.isVerified) return null;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;
    return user;
  }

  private static generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOtp(email: string) {
    const otp = this.generateOtp();
    let user = await Login.findOne({ where: { email } });
    if (!user) {
      user = await Login.create({ email, password: "temp" });
    }
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.isVerified = false;
    await user.save();

    console.log("OTP:", otp);
    await sendEmail(email, "Your OTP Verification", `Your OTP is ${otp}. It expires in 10 minutes.`);
    return true;
  }

  static async verifyOtp(email: string, otp: string) {
    const user = await Login.findOne({ where: { email } });
    if (!user) throw new Error("User not found");
    if (user.otp !== otp) throw new Error("Invalid OTP");
    if (!user.otpExpiry || user.otpExpiry < new Date()) throw new Error("OTP expired");

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    return true;
  }

  static async signup(email: string, password: string) {
    const user = await Login.findOne({ where: { email } });
    if (!user || !user.isVerified) throw new Error("Email not verified");
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    return user;
  }

  static async updateRole(id: number, role: string) {
    const user = await Login.findByPk(id);
    if (!user) throw new Error("User not found");
    user.role = role;
    await user.save();
    return user;
  }

  static async generateTokens(user: { id: number; email: string; role: string; tokenVersion: number }) {
    const accessJti = uuidv4();
    const refreshJti = uuidv4();

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, jti: accessJti, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, jti: refreshJti },
      process.env.REFRESH_SECRET as string,
      { expiresIn: '7d' }
    );

    await RefreshToken.create({
      userId: user.id,
      jti: refreshJti,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }

  static async refreshAccessToken(refreshToken: string) {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET as string
    ) as { id: number; jti: string };

    const stored = await RefreshToken.findOne({ where: { jti: decoded.jti } });
    if (!stored) throw new Error('Invalid refresh token');
    if (stored.expiresAt < new Date()) {
      await stored.destroy();
      throw new Error('Refresh token expired');
    }

    const user = await Login.findByPk(stored.userId);
    if (!user) throw new Error('User not found');

    const accessJti = uuidv4();
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, jti: accessJti, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    return { accessToken };
  }

  static async logout(refreshToken: string, accessToken: string) {
    
    const decodedRefresh = jwt.decode(refreshToken) as { jti: string };
    if (decodedRefresh?.jti) {
      await RefreshToken.destroy({ where: { jti: decodedRefresh.jti } });
    }

    const decodedAccess = jwt.decode(accessToken) as { jti: string; exp: number };
    if (decodedAccess?.jti && decodedAccess?.exp) {
      await TokenBlacklist.create({
        jti: decodedAccess.jti,
        expiresAt: new Date(decodedAccess.exp * 1000),
      });
    }

    return true;
  }

  static async logoutAll(userId: number) {
    
    const user = await Login.findByPk(userId);
    if (!user) throw new Error("User not found");
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    await RefreshToken.destroy({ where: { userId } });

    return true;
  }

  static async createGuestLogin(email: string) {
  let user = await Login.findOne({ where: { email } });
  if (!user) {
    user = await Login.create({ email, password: "temp" });
  }
  return user;
}

static async msalLogin(azureToken: string) {
  const { email } = await verifyAzureToken(azureToken);

  const user = await Login.findOne({ where: { email } });
  if (!user) throw new Error('Account not provisioned. Contact HR.');

  return user;
}

static async createEmployeeLogin(email: string, role: string) {
  const existing = await Login.findOne({ where: { email } });
  if (existing) throw new Error("Email already exists");

  const randomPassword = randomBytes(32).toString('hex');
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  return await Login.create({ email, password: hashedPassword, role, isVerified: true });
}
}