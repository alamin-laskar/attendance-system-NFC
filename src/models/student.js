import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    rollNo: { type: String, required: true },
    regNo: { type: String, required: true },
    admissionYear: { type: Number, required: true },
    age: { type: Number, required: true },
    semester: { type: String, required: true },
    branch: { type: String, required: true },
    lastSeen: { type: Date, default: Date.now }
});

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
