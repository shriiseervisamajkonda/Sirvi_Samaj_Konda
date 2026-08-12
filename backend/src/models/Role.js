import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['super_admin', 'admin', 'editor', 'member', 'visitor'],
    },
    permissions: [{ type: String }],
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model('Role', roleSchema);
