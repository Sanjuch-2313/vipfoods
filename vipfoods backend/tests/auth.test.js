import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

test('registered credentials log in, normalize email, and reject a wrong password', async () => {
  const users = [];
  const User = {
    findOne(query) {
      const result = users.find(user => Object.entries(query).every(([key, value]) => user[key] === value)) || null;
      const promise = Promise.resolve(result);
      promise.select = () => promise;
      return promise;
    },
    async create(data) { const user = { ...data, _id: 'test-user' }; users.push(user); return user; },
  };
  const secret = 'isolated-auth-test-secret';
  const context = vm.createContext({ console, process: { env: { JWT_SECRET: secret } } });
  const module = new vm.SourceTextModule(await fs.readFile(new URL('../controllers/authController.js', import.meta.url), 'utf8'), { context });
  const dependencies = {
    bcryptjs: { default: bcrypt }, jsonwebtoken: { default: jwt }, '../models/User.js': { default: User },
    '../utils/razorpayPayment.js': { getRazorpay() { throw new Error('Unexpected payment'); }, toPaise: n => Math.round(n * 100), verifyRazorpayPayment() {} },
  };
  await module.link(name => {
    const values = dependencies[name];
    assert.ok(values, name);
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await module.evaluate();
  const response = () => ({ status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
  const registered = response();
  await module.namespace.registerUser({ body: { name: 'Test Customer', email: ' Test@Example.com ', mobile: '9876543210', password: 'test-only-pass123' } }, registered);
  assert.equal(registered.code, 201);
  assert.notEqual(users[0].password, 'test-only-pass123');
  const loggedIn = response();
  await module.namespace.loginUser({ body: { email: ' TEST@example.COM ', password: 'test-only-pass123' } }, loggedIn);
  assert.equal(loggedIn.code, 200);
  assert.equal(jwt.verify(loggedIn.body.token, secret).userId, 'test-user');
  assert.equal(loggedIn.body.user.password, undefined);
  const rejected = response();
  await module.namespace.loginUser({ body: { email: 'test@example.com', password: 'wrong-password' } }, rejected);
  assert.equal(rejected.code, 401);
});
