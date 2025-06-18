function determineRole(user) {
  const {
    toeicScore,
    eikenGrade,
    experienceYears,
    nativeLanguage,
    hasTeachingCert,
    postCount
  } = user;

  if (hasTeachingCert) return "certified_teacher";
  if (nativeLanguage === "English") return "native";

  if (
    toeicScore >= 900 || 
    eikenGrade === "1級" || 
    experienceYears >= 5 || 
    postCount >= 2000
  ) return "expert";

  if (
    toeicScore >= 700 || 
    eikenGrade === "準1級" || 
    experienceYears >= 3 || 
    postCount >= 500
  ) return "advanced";

  if (
    toeicScore >= 400 || 
    experienceYears >= 1 || 
    postCount >= 100
  ) return "intermediate";

  return "beginner";
}