'use strict';

const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/apiResponse.utils');

// Express 5: async errors are automatically forwarded to the error handler

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.register({ name, email, password });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return successResponse(res, { user, accessToken }, 'Registration successful.', 201);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login({ email, password });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return successResponse(res, { user, accessToken }, 'Login successful.');
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken) {
    return errorResponse(res, 'Refresh token required.', 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(refreshToken);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return successResponse(res, { accessToken }, 'Token refreshed.');
};

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  await authService.logout(refreshToken);
  res.clearCookie('refreshToken');
  return successResponse(res, {}, 'Logged out successfully.');
};

const getMe = async (req, res) => {
  return successResponse(res, { user: req.user }, 'User fetched.');
};

module.exports = { register, login, refresh, logout, getMe };
