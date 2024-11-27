import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  avatar?: string;
  classId?: Schema.Types.ObjectId;
  teacherId?: Schema.Types.ObjectId;
  parentId?: Schema.Types.ObjectId;
  studentIds?: Schema.Types.ObjectId[];
  classIds?: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'parent', 'admin'],
    required: true
  },
  avatar: String,
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class'
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  studentIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  classIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Class'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);