export type ResumeFormValues = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string;
  experienceRole: string;
  experienceCompany: string;
  experienceStart: string;
  experienceEnd: string;
  experienceSummary: string;
  educationHighSchoolDegree: string;
  educationHighSchoolSchool: string;
  educationHighSchoolYear: string;
  educationUndergraduateDegree: string;
  educationUndergraduateSchool: string;
  educationUndergraduateYear: string;
  educationGraduateDegree: string;
  educationGraduateSchool: string;
  educationGraduateYear: string;
};

export type ResumeData = {
  personal: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    startDate: string;
    endDate: string;
    summary: string;
  }[];
  education: {
    level: "High School" | "Undergraduate" | "Graduate";
    degree: string;
    school: string;
    year: string;
  }[];
};
