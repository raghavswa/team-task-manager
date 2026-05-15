'use strict';

const { User, RefreshToken } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');
const { Op } = require('sequelize');

class AuthService {
  async register({ name, email, password }) {
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      const err = new Error('Email already in use.');
      err.statusCode = 409;
      throw err;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await User.scope('withPassword').findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    // Return user without password
    const safeUser = await User.findByPk(user.id);
    return { user: safeUser, accessToken, refreshToken };
  }

  async refreshTokens(refreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      const err = new Error('Invalid or expired refresh token.');
      err.statusCode = 401;
      throw err;
    }

    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken, isRevoked: false },
    });

    if (!storedToken || RefreshToken.isExpired(storedToken)) {
      const err = new Error('Refresh token expired or revoked.');
      err.statusCode = 401;
      throw err;
    }

    // Rotate: revoke old, issue new
    await storedToken.update({ isRevoked: true });

    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = await generateRefreshToken(decoded.userId);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken) {
    if (refreshToken) {
      await RefreshToken.update(
        { isRevoked: true },
        { where: { token: refreshToken } }
      );
    }
  }

  async cleanupExpiredTokens() {
    await RefreshToken.destroy({
      where: {
        [Op.or]: [
          { expiresAt: { [Op.lt]: new Date() } },
          { isRevoked: true },
        ],
      },
    });
  }
}

module.exports = new AuthService();
