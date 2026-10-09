import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  kind: { type: String, enum: ['state', 'ticket'], required: true },
  provider: { type: String, enum: ['google', 'facebook'], required: true },
  challenge: { type: String, required: true },
  verifier: String,
  profile: { id: String, email: String, name: String },
  site: { type: String },
  expiresAt: { type: Date, required: true, expires: 0 },
});
export default mongoose.model('SocialLogin', schema);
