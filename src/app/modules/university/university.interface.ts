export type UniversityData = {
  _id?: string;
  name: string;
  image: string;
  location: string;
  type: 'Public' | 'Private' | 'International';
  ranking: {
    national: number;
    qs: number;
  };
  programs: string[];
  intakes: string[];
  description: string;
  tuitionFees: {
    undergraduate: string;
    postgraduate: string;
  };
  facilities: string[];
  admissionRequirements: string[];
  scholarships: {
    name: string;
    description: string;
  }[];
}

export type UniversityFilters = {
    searchTerm?: string;
    type?: string;
    location?: string;
    ranking?: string;
    programs?: string;
    intakes?: string;
    tuitionFees?: string;
    facilities?: string;
    admissionRequirements?: string;
    scholarships?: string;
}
