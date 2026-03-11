import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import cache from './cache';
import { fetchAllPRs } from './github';
import { appConfig } from './config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(express.json());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// Extend session type
declare module 'express-session' {
  interface SessionData {
    accessToken?: string;
    userLogin?: string;
    userAvatarUrl?: string;
    csrfToken?: string;
  }
}

// CSRF token middleware: generate a token per session and validate on mutating requests
app.use((req, res, next) => {
  // Ensure every session has a CSRF token
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE' || req.method === 'PATCH') {
    const clientToken = req.headers['x-csrf-token'] as string | undefined;
    if (!clientToken || clientToken !== req.session.csrfToken) {
      res.status(403).json({ error: 'Forbidden: invalid CSRF token' });
      return;
    }
  }
  next();
});

// Expose CSRF token to the frontend
app.get('/auth/csrf-token', (req, res) => {
  res.json({ csrfToken: req.session.csrfToken });
});

// ========================
// Auth Routes
// ========================

// Initiate GitHub OAuth
app.get('/auth/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: 'GitHub OAuth not configured' });
    return;
  }
  const scope = 'repo read:org read:user';
  const redirectUri = `${req.protocol}://${req.get('host')}/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(url);
});

// GitHub OAuth callback
app.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    res.redirect(`${FRONTEND_URL}?error=no_code`);
    return;
  }

  try {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      res.redirect(`${FRONTEND_URL}?error=no_token`);
      return;
    }

    // Fetch user info
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    req.session.accessToken = accessToken;
    req.session.userLogin = userResponse.data.login;
    req.session.userAvatarUrl = userResponse.data.avatar_url;

    res.redirect(FRONTEND_URL);
  } catch (err) {
    console.error('OAuth error:', err);
    res.redirect(`${FRONTEND_URL}?error=oauth_failed`);
  }
});

// Get current user
app.get('/auth/me', (req, res) => {
  if (!req.session.accessToken) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({
    login: req.session.userLogin,
    avatarUrl: req.session.userAvatarUrl,
  });
});

// Logout
app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

// ========================
// PR Routes
// ========================

app.get('/api/prs', async (req, res) => {
  if (!req.session.accessToken) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const cacheKey = `prs:${req.session.userLogin}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    res.json({ data: cached, cached: true });
    return;
  }

  try {
    const prs = await fetchAllPRs(req.session.accessToken, appConfig.repositories);
    cache.set(cacheKey, prs);
    res.json({ data: prs, cached: false });
  } catch (err) {
    console.error('Failed to fetch PRs:', err);
    res.status(500).json({ error: 'Failed to fetch pull requests' });
  }
});

// Force refresh - clears cache
app.post('/api/prs/refresh', async (req, res) => {
  if (!req.session.accessToken) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const cacheKey = `prs:${req.session.userLogin}`;
  cache.del(cacheKey);

  try {
    const prs = await fetchAllPRs(req.session.accessToken, appConfig.repositories);
    cache.set(cacheKey, prs);
    res.json({ data: prs, cached: false });
  } catch (err) {
    console.error('Failed to refresh PRs:', err);
    res.status(500).json({ error: 'Failed to refresh pull requests' });
  }
});

// Get configured repositories
app.get('/api/config', (req, res) => {
  res.json({ repositories: appConfig.repositories });
});

app.listen(PORT, () => {
  console.log(`PR Sentinel backend running on port ${PORT}`);
});

export default app;
