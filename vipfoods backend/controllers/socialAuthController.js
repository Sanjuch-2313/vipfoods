import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import SocialLogin from '../models/SocialLogin.js';

const hash = value => crypto.createHash('sha256').update(value).digest('base64url');
const random = () => crypto.randomBytes(32).toString('base64url');
const fail = (message, status = 400) => Object.assign(new Error(message), { status });

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://vipfood.in',
  'https://www.vipfood.in',
  'https://admin.vipfood.in',
  'https://vip203.netlify.app',
];

function resolveFrontendUrl(req) {
  const origin = req?.headers?.origin || (req?.headers?.referer ? new URL(req.headers.referer).origin : null);
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  return (
    process.env.OAUTH_FRONTEND_URL?.replace(/\/$/, '') ||
    process.env.FRONTEND_URL?.replace(/\/$/, '') ||
    'http://localhost:5173'
  );
}

function resolveApiUrl(req) {
  if (process.env.OAUTH_API_URL) {
    return process.env.OAUTH_API_URL.replace(/\/$/, '');
  }
  const host = req?.get ? req.get('host') : req?.headers?.host;
  const protocol = req?.protocol || 'http';
  if (host) {
    return `${protocol}://${host}/api`;
  }
  return `http://localhost:${process.env.PORT || 5001}/api`;
}

function config(provider, req) {
  if (!['google', 'facebook'].includes(provider)) throw fail('Unknown sign-in provider.');
  const prefix = provider.toUpperCase();
  const id = process.env[`${prefix}_CLIENT_ID`];
  const secret = process.env[`${prefix}_CLIENT_SECRET`];
  const api = resolveApiUrl(req);
  const site = resolveFrontendUrl(req);
  const version = process.env.FACEBOOK_GRAPH_VERSION || 'v19.0';
  const isConfigured = Boolean(
    id &&
    secret &&
    process.env.JWT_SECRET &&
    (provider !== 'facebook' || /^v\d+\.\d+$/.test(version || ''))
  );
  return { id, secret, site, redirect: `${api}/auth/social/${provider}/callback`, version, isConfigured };
}

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  if (!response.ok || data.error) throw fail('The sign-in provider could not verify this login. Please try again.');
  return data;
}

export async function getSocialStatus(req, res) {
  try {
    const google = config('google', req);
    const facebook = config('facebook', req);
    res.json({
      google: { configured: google.isConfigured },
      facebook: { configured: facebook.isConfigured },
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to check social auth status' });
  }
}

export async function startSocialLogin(req, res) {
  try {
    const provider = req.params.provider;
    const c = config(provider, req);
    const challenge = req.body?.challenge;
    if (typeof challenge !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(challenge)) throw fail('Invalid sign-in request.');

    // If provider has real credentials configured in environment:
    if (c.isConfigured) {
      const state = random();
      const verifier = random();
      await SocialLogin.create({
        key: hash(state),
        kind: 'state',
        provider,
        challenge,
        verifier,
        site: c.site,
        expiresAt: new Date(Date.now() + 10 * 60_000),
      });
      const url = new URL(
        provider === 'google'
          ? 'https://accounts.google.com/o/oauth2/v2/auth'
          : `https://www.facebook.com/${c.version}/dialog/oauth`
      );
      url.search = new URLSearchParams({
        client_id: c.id,
        redirect_uri: c.redirect,
        response_type: 'code',
        state,
        scope: provider === 'google' ? 'openid email profile' : 'email,public_profile',
        ...(provider === 'google' ? { code_challenge: hash(verifier), code_challenge_method: 'S256', prompt: 'select_account' } : {}),
      }).toString();
      return res.set('Cache-Control', 'no-store').json({ url: url.toString() });
    }

    // Development / Mock mode when real credentials are not yet set
    const mockEmail =
      req.body?.email && typeof req.body.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email.trim())
        ? req.body.email.trim().toLowerCase()
        : provider === 'google'
        ? 'google.user@vipfood.in'
        : 'facebook.user@vipfood.in';

    const mockName =
      req.body?.name && typeof req.body.name === 'string' && req.body.name.trim().length > 0
        ? req.body.name.trim()
        : provider === 'google'
        ? 'Google User'
        : 'Facebook User';

    const mockId = `${provider}_dev_${crypto.createHash('md5').update(mockEmail).digest('hex').slice(0, 16)}`;

    const ticket = random();
    await SocialLogin.create({
      key: hash(ticket),
      kind: 'ticket',
      provider,
      challenge,
      profile: { id: mockId, email: mockEmail, name: mockName },
      site: c.site,
      expiresAt: new Date(Date.now() + 5 * 60_000),
    });

    const redirectUrl = `${c.site}/social-callback#ticket=${ticket}&dev=true&provider=${provider}`;
    return res.set('Cache-Control', 'no-store').json({ url: redirectUrl, devMode: true });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Unable to start sign-in.' });
  }
}

export async function socialCallback(req, res) {
  let c;
  let frontendSite;
  try {
    const provider = req.params.provider;
    c = config(provider, req);
    frontendSite = c.site;
    if (typeof req.query.state !== 'string') throw fail('Sign-in session is missing. Please try again.');
    const attempt = await SocialLogin.findOneAndDelete({
      key: hash(req.query.state),
      kind: 'state',
      provider,
      expiresAt: { $gt: new Date() },
    });
    if (!attempt) throw fail('Sign-in session expired. Please try again.');
    if (attempt.site) frontendSite = attempt.site;
    if (req.query.error) throw fail('Sign-in was cancelled. You can try again or use email and password.');
    if (typeof req.query.code !== 'string') throw fail('No authorization code received.');

    let profile;
    if (provider === 'google') {
      const token = await jsonRequest('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: req.query.code,
          client_id: c.id,
          client_secret: c.secret,
          redirect_uri: c.redirect,
          grant_type: 'authorization_code',
          code_verifier: attempt.verifier,
        }),
      });
      const info = await jsonRequest('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      if (!info.email_verified || !info.sub) throw fail('Google did not return a verified email address.');
      profile = { id: info.sub, name: info.name, email: info.email };
    } else {
      const tokenUrl = new URL(`https://graph.facebook.com/${c.version}/oauth/access_token`);
      tokenUrl.search = new URLSearchParams({
        code: req.query.code,
        client_id: c.id,
        client_secret: c.secret,
        redirect_uri: c.redirect,
      }).toString();
      const token = await jsonRequest(tokenUrl);
      const infoUrl = new URL(`https://graph.facebook.com/${c.version}/me`);
      infoUrl.search = new URLSearchParams({
        fields: 'id,name,email',
        appsecret_proof: crypto.createHmac('sha256', c.secret).update(token.access_token).digest('hex'),
      }).toString();
      const info = await jsonRequest(infoUrl, { headers: { Authorization: `Bearer ${token.access_token}` } });
      profile = { id: info.id, name: info.name, email: info.email };
    }

    if (!profile.id || typeof profile.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      throw fail('No email was shared. Allow email access or register with email and password.');
    }
    profile.email = profile.email.trim().toLowerCase();
    profile.name = profile.name?.trim() || profile.email.split('@')[0];

    const ticket = random();
    await SocialLogin.create({
      key: hash(ticket),
      kind: 'ticket',
      provider,
      challenge: attempt.challenge,
      profile,
      site: frontendSite,
      expiresAt: new Date(Date.now() + 5 * 60_000),
    });

    res.set('Cache-Control', 'no-store').set('Referrer-Policy', 'no-referrer').redirect(`${frontendSite}/social-callback#ticket=${ticket}`);
  } catch (error) {
    const site = frontendSite || c?.site || 'http://localhost:5173';
    res.set('Cache-Control', 'no-store').redirect(
      `${site}/social-callback#error=${encodeURIComponent(error.status ? error.message : 'Unable to complete sign-in. Please try again.')}`
    );
  }
}

export async function finishSocialLogin(req, res) {
  try {
    const { ticket, verifier, password } = req.body || {};
    if (typeof ticket !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(ticket) || typeof verifier !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(verifier)) {
      throw fail('Invalid sign-in session. Please start again.');
    }
    const query = { key: hash(ticket), kind: 'ticket', challenge: hash(verifier), expiresAt: { $gt: new Date() } };
    const attempt = await SocialLogin.findOne(query);
    if (!attempt) throw fail('Sign-in session expired or already used. Please start again.');

    const field = `${attempt.provider}Id`;
    let user = await User.findOne({ [field]: attempt.profile.id });
    if (!user) {
      user = await User.findOne({ email: attempt.profile.email });
      // Never silently merge a provider identity into an existing password account.
      if (user) {
        if (user[field] && user[field] !== attempt.profile.id) {
          throw fail('This email is linked to a different provider account. Use your original login.');
        }
        if (user.password && !password) {
          return res.status(409).json({
            code: 'PASSWORD_REQUIRED',
            message: 'This email already has an account. Enter its existing VIP Foods password once to link this sign-in.',
          });
        }
        if (user.password && password) {
          const passMatch = await bcrypt.compare(password, user.password);
          if (!passMatch) throw fail('The existing account password is incorrect.', 401);
        }
      }
    }

    if (!process.env.JWT_SECRET) throw fail('Sign-in is unavailable. Please try again later.', 503);
    if (!(await SocialLogin.findOneAndDelete(query))) throw fail('Sign-in session already used.');

    if (!user) {
      user = await User.create({
        name: attempt.profile.name,
        email: attempt.profile.email,
        [field]: attempt.profile.id,
        password: await bcrypt.hash(random(), 12),
        isVerified: true,
      });
    } else if (!user[field]) {
      user = await User.findOneAndUpdate(
        { _id: user._id, [field]: { $exists: false } },
        { $set: { [field]: attempt.profile.id } },
        { new: true }
      );
      if (!user) throw fail('Account changed. Please sign in again.');
    }

    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.set('Cache-Control', 'no-store').json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile || '',
        walletBalance: user.walletBalance || 0,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Could not finish sign-in. Please try again.' });
  }
}
