import {Request, Response} from 'express';
import {loginService} from '../service/loginService';
import { AuthRequest } from '../middleware/auth';
import axios from "axios";

export async function createClogin(req: Request, res: Response) {
    try {
        const {email, password} = req.body;
        const newClogin = await loginService.createClogin(email, password);
        res.status(201).json(newClogin);
    } catch (error) {
        res.status(500).json({error: 'Failed to create Clogin'});
    }
}

export async function getAllClogin(req: Request, res: Response) {
    try {
        const clogins = await loginService.getAllClogins();
        res.status(200).json(clogins);
    } catch (error) {
        res.status(500).json({error: 'Failed to retrieve Clogins'});
    }
}

// export async function sendOtp(req: Request, res: Response) {
//   try {
//     const { email } = req.body;

//     await loginService.sendOtp(email);

//     res.json({ message: "OTP sent" });

//   } catch (error: any) {
//     res.status(400).json({
//       message: error.message,
//     });
//   }
// }

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    await loginService.verifyOtp(email, otp);

    res.json({ message: "Verified" });

  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
}


export async function signup(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await loginService.signup(
      email,
      password
    );

    res.json(user);

  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
}

export async function updateRole(req: Request, res: Response) {
  try {

    const id = Number(req.params.id);
    const { role } = req.body;

    const user = await loginService.updateRole(id, role);

    res.json(user);

  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
}

// export async function loginClogin(req: Request, res: Response) {
//   try {
//     const { email, password } = req.body;
//     const user = await loginService.login(email, password);
//     if (!user) return res.status(401).json({ message: "Invalid email or password" });

//     const { accessToken, refreshToken } = await loginService.generateTokens({
//       id: user.id, email: user.email, role: user.role
//     });

//     // Refresh token in httpOnly cookie
//     res.cookie('refreshToken', refreshToken, {
//       httpOnly: true,
//       secure: false,
//       sameSite: 'lax',
//       path: '/', 
//       maxAge: 7 * 24 * 60 * 60 * 1000
//     });

//     return res.status(200).json({
//       message: "Login successful",
//       token: accessToken,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Login failed" });
//   }
// }

export async function loginClogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await loginService.login(email, password);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const { accessToken, refreshToken } = await loginService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Login successful", token: accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const { accessToken } = await loginService.refreshAccessToken(refreshToken);
    res.json({ token: accessToken });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
}

export async function logout(req: AuthRequest, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.headers.authorization?.split(" ")[1];  // get accessToken

    if (refreshToken && accessToken) {
      await loginService.logout(refreshToken, accessToken);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    res.json({ message: "Logged out" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function logoutAll(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (userId) {
      await loginService.logoutAll(userId);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    res.json({ message: "Logged out from all devices" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function createGuestLogin(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = await loginService.createGuestLogin(email);
    res.status(201).json({ id: user.id });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create guest login" });
  }
}

export async function msalLoginController(req: Request, res: Response) {
  try {
    const { azureToken } = req.body;
    if (!azureToken) return res.status(400).json({ message: 'Azure token required' });

    const user = await loginService.msalLogin(azureToken);

    const { accessToken, refreshToken } = await loginService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: 'Login successful', token: accessToken });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
}

export async function createEmployeeLogin(req: Request, res: Response) {
  try {
    const { email, role } = req.body;
    const user = await loginService.createEmployeeLogin(email, role);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function sendOtp(req: Request, res: Response) {
  try {
    const { email, captchaToken } = req.body;

    // Verify CAPTCHA first
    const verify = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        },
      }
    );

    if (!verify.data.success) {
      return res.status(400).json({ message: "CAPTCHA verification failed" });
    }

    await loginService.sendOtp(email);

    res.json({ message: "OTP sent" });

  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}