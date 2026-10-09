import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const hash = s => crypto.createHash('sha256').update(s).digest('base64url');

test('social ticket requires browser proof, links only after password, and cannot replay', async () => {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const ticket = crypto.randomBytes(32).toString('base64url');
  let attempt = {
    key: hash(ticket),
    challenge: hash(verifier),
    kind: 'ticket',
    provider: 'google',
    profile: { id: 'google-123', email: 'test@example.com' },
    expiresAt: new Date(Date.now() + 60000),
  };
  const user = {
    _id: 'user-1',
    email: 'test@example.com',
    name: 'Test',
    password: await bcrypt.hash('existing-password', 4),
  };
  const matches = q =>
    attempt &&
    q.key === attempt.key &&
    q.challenge === attempt.challenge &&
    attempt.expiresAt > q.expiresAt.$gt;
  const createdLogins = [];
  const SocialLogin = {
    async create(doc) {
      createdLogins.push(doc);
      return doc;
    },
    async findOne(q) {
      return matches(q) ? attempt : null;
    },
    async findOneAndDelete(q) {
      if (!matches(q)) return null;
      const result = attempt;
      attempt = null;
      return result;
    },
  };
  const User = {
    async findOne(q) {
      return Object.entries(q).every(([k, v]) => user[k] === v) ? user : null;
    },
    async findOneAndUpdate(q, update) {
      Object.assign(user, update.$set);
      return user;
    },
    async create(data) {
      return { ...data, _id: 'new-user' };
    },
  };
  const context = vm.createContext({
    process: { env: { JWT_SECRET: 'test-secret', FRONTEND_URL: 'http://localhost:5173' } },
    URL,
    URLSearchParams,
  });
  const module = new vm.SourceTextModule(
    await fs.readFile(new URL('../controllers/socialAuthController.js', import.meta.url), 'utf8'),
    { context }
  );
  const deps = {
    'node:crypto': crypto,
    bcryptjs: bcrypt,
    jsonwebtoken: jwt,
    '../models/User.js': User,
    '../models/SocialLogin.js': SocialLogin,
  };
  await module.link(name =>
    new vm.SyntheticModule(
      ['default'],
      function () {
        this.setExport('default', deps[name]);
      },
      { context }
    )
  );
  await module.evaluate();

  const response = () => ({
    code: 200,
    set() {
      return this;
    },
    status(n) {
      this.code = n;
      return this;
    },
    json(b) {
      this.body = b;
      return this;
    },
  });

  const callFinish = async body => {
    const r = response();
    await module.namespace.finishSocialLogin({ body }, r);
    return r;
  };

  // 1. Invalid verifier rejected
  assert.equal((await callFinish({ ticket, verifier: 'x'.repeat(43) })).code, 400);

  // 2. Existing account requires password
  assert.equal((await callFinish({ ticket, verifier })).body.code, 'PASSWORD_REQUIRED');
  assert.equal(user.googleId, undefined);

  // 3. Incorrect password rejected
  assert.equal((await callFinish({ ticket, verifier, password: 'wrong' })).code, 401);

  // 4. Correct password links provider
  const result = await callFinish({ ticket, verifier, password: 'existing-password' });
  assert.equal(result.body.success, true);
  assert.equal(jwt.verify(result.body.token, 'test-secret').userId, 'user-1');
  assert.equal(user.googleId, 'google-123');
  assert.equal(result.body.user.password, undefined);

  // 5. Ticket cannot be replayed
  assert.equal((await callFinish({ ticket, verifier })).code, 400);

  // 6. Missing challenge rejected with 400
  const missingChallenge = response();
  await module.namespace.startSocialLogin({ params: { provider: 'google' }, body: {} }, missingChallenge);
  assert.equal(missingChallenge.code, 400);

  // 7. Dev mode starts successfully with valid challenge
  const validChallenge = '1234567890123456789012345678901234567890123';
  const startDev = response();
  await module.namespace.startSocialLogin(
    { params: { provider: 'google' }, body: { challenge: validChallenge } },
    startDev
  );
  assert.equal(startDev.code, 200);
  assert.ok(startDev.body.url.includes('/social-callback#ticket='));
  assert.equal(startDev.body.devMode, true);

  // 8. Social status check reports unconfigured when no OAuth credentials
  const statusRes = response();
  await module.namespace.getSocialStatus({}, statusRes);
  assert.equal(statusRes.body.google.configured, false);
  assert.equal(statusRes.body.facebook.configured, false);
});
