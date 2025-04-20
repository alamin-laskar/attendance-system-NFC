// ./src/models/attendance.js
import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nfcId: {
    type: String,
    required: true,
    index: true // for faster queries
  },
  subject: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent'],
    default: 'present'
  },
  scanTime: {
    type: Date,
    required: true
  },
  // For handling any specific class timing rules
  classSession: {
    type: String,
    required: true // e.g., "morning", "afternoon", or specific time slot
  },
  metadata: {
    deviceId: String, // ID of the ESP device that recorded this
    location: String, // Optional: if you have multiple scanning locations
    verificationMethod: {
      type: String,
      default: 'nfc'
    }
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Compound index for efficient querying by date and user
AttendanceSchema.index({ user: 1, date: 1 });
// Index for subject-based queries
AttendanceSchema.index({ subject: 1, semester: 1 });

// Static method to get attendance statistics for a user
AttendanceSchema.statics.getUserStats = async function(userId, semester) {
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        semester: semester
      }
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);
};

// Method to check if a user has already been marked present for a specific class
AttendanceSchema.statics.hasAttendedClass = async function(userId, subject, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await this.findOne({
    user: userId,
    subject: subject,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).exec();
};

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);