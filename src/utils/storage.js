const STORAGE_KEY = 'techfolio_data';

export const defaultProfile = {
  name: '',
  title: '',
  education: [],
  bio: '',
  experience: [],
  certifications: [],
  skills: [],
  resumeUrl: '',
  github: '',
  linkedin: '',
  email: '',
  photo: '',
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { profile: defaultProfile, projects: [] };
    const data = JSON.parse(raw);
    // Migrate old string education to array
    if (typeof data.profile?.education === 'string') {
      data.profile.education = data.profile.education
        ? [{ id: Date.now().toString(36), institution: data.profile.education, degree: '', field: '', startDate: '', endDate: '', expected: false }]
        : [];
    }
    // Migrate old string experience to array
    if (typeof data.profile?.experience === 'string') {
      data.profile.experience = data.profile.experience
        ? [{ id: Date.now().toString(36) + 'e', company: '', title: '', startDate: '', endDate: '', current: false, description: data.profile.experience }]
        : [];
    }
    // Remove legacy PDF blob fields (replaced by resumeUrl)
    if (data.profile) {
      delete data.profile.resume;
      delete data.profile.resumeName;
    }
    return data;
  } catch {
    return { profile: defaultProfile, projects: [] };
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
