// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  },
  subjects: {
    type: [{
      name: {
        type: String,
        required: true
      },
      code: {
        type: String,
        required: true
      },
      semester: {
        type: String,
        required: true
      }
    }],
    validate: {
      validator: function(v) {
        return this.role !== 'teacher' || (Array.isArray(v) && v.length > 0);
      },
      message: 'Teachers must have at least one subject'
    },
    required: function() { return this.role === 'teacher'; }
  },
  department: {
    type: String,
    required: function() { return this.role === 'student' || this.role === 'teacher'; }
  },
  qualification: {
    type: String,
    required: function() { return this.role === 'teacher'; }
  },
  specialization: {
    type: String,
    required: function() { return this.role === 'teacher'; }
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  regNo: {
    type: String,
    unique: true,
    sparse: true,
  },
  semester: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  phone: {
    type: String,
    required: function() { return this.role === 'student'; },
    match: [/^[0-9]{10}$/, 'Please provide a valid phone number']
  },
  nfcId: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);