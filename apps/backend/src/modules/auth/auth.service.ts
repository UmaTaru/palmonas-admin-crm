import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../database/pool";
import { configService } from "../../config/config.service";

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }
  return secret;
}


export class AuthService {
  async login(email: string, password: string) {
    const { rows } = await pool.query(
      "SELECT id, email, password_hash, role FROM users WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      throw new Error("Row length is 0");
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      throw new Error("Not Match credentials");
    }

    const accessExpirySeconds = Number(
      configService.get("ACCESS_TOKEN_EXPIRY")
    );

    const refreshExpirySeconds = Number(
      configService.get("REFRESH_TOKEN_EXPIRY")
    );

    if (isNaN(accessExpirySeconds) || accessExpirySeconds <= 0) {
      throw new Error("Invalid ACCESS_TOKEN_EXPIRY configuration");
    }

    if (isNaN(refreshExpirySeconds) || refreshExpirySeconds <= 0) {
      throw new Error("Invalid REFRESH_TOKEN_EXPIRY configuration");
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, getAccessSecret(), {
  expiresIn: accessExpirySeconds,
});

const refreshToken = jwt.sign(payload, getRefreshSecret(), {
  expiresIn: refreshExpirySeconds,
});

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        getRefreshSecret()
      ) as JwtPayload;

      const accessExpirySeconds = Number(
        configService.get("ACCESS_TOKEN_EXPIRY")
      );

      if (!accessExpirySeconds || isNaN(accessExpirySeconds)) {
        throw new Error("Invalid ACCESS_TOKEN_EXPIRY configuration");
      }

      const newAccessToken = jwt.sign(decoded, getAccessSecret(), {
        expiresIn: accessExpirySeconds,
      });

      return { accessToken: newAccessToken };
    } catch (err) {
      throw new Error("Invalid or expired refresh token");
    }
  }
}
