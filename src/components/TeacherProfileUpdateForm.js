'use client';

import { useState } from 'react';
import { useAuth } from '@/context/authContext';
import { useToast } from '@/context/toastContext';
import styles from './styles/TeacherProfileUpdateForm.module.css';

export default function TeacherProfileUpdateForm({ initialData, onSuccess }) {
  const { checkAuth } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    department: initialData?.department || '',
    qualification: initialData?.qualification || '',
    specialization: initialData?.specialization || '',
    subjects: initialData?.subjects?.length > 0 
      ? initialData.subjects 
      : [{ name: '', code: '', semester: '' }]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectChange = (index, field, value) => {
    setFormData(prev => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[index] = {
        ...updatedSubjects[index],
        [field]: value
      };
      return {
        ...prev,
        subjects: updatedSubjects
      };
    });
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { name: '', code: '', semester: '' }]
    }));
  };

  const removeSubject = (index) => {
    if (formData.subjects.length > 1) {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/teacher/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      showToast('Profile updated successfully', 'success');
      await checkAuth(true); // Force refresh auth context
      setIsEditing(false);
      if (onSuccess) onSuccess(data.user);
    } catch (error) {
      showToast(error.message || 'Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className={styles.viewMode}>
        <div className={styles.header}>
          <h2 className={styles.title}>Profile Information</h2>
          <button 
            className={styles.editButton}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Personal Details</h3>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>{initialData?.name}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Department:</span>
                <span className={styles.value}>{initialData?.department || 'Not set'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Qualification:</span>
                <span className={styles.value}>{initialData?.qualification || 'Not set'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Specialization:</span>
                <span className={styles.value}>{initialData?.specialization || 'Not set'}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Subjects</h3>
            <div className={styles.subjectsList}>
              {initialData?.subjects?.map((subject, index) => (
                <div key={index} className={styles.subjectItem}>
                  <span className={styles.subjectName}>{subject.name}</span>
                  <div className={styles.subjectMeta}>
                    <span className={styles.subjectCode}>Code:{subject.code}</span>
                    <span className={styles.subjectSemester}>Semester :  {subject.semester}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h2 className={styles.title}>Edit Profile</h2>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Personal Details</h3>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="department">Department *</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="qualification">Qualification *</label>
              <input
                type="text"
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="specialization">Specialization *</label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Subjects</h3>
          {formData.subjects.map((subject, index) => (
            <div key={index} className={styles.subjectForm}>
              <div className={styles.subjectInputs}>
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={subject.name}
                  onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Subject Code"
                  value={subject.code}
                  onChange={(e) => handleSubjectChange(index, 'code', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Semester"
                  value={subject.semester}
                  onChange={(e) => handleSubjectChange(index, 'semester', e.target.value)}
                  required
                />
              </div>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeSubject(index)}
                disabled={formData.subjects.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.addButton}
            onClick={addSubject}
          >
            Add Subject
          </button>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => setIsEditing(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}