export interface Employee {
  profile: Profile;
  employmentStartDate: string;
  employmentType: string;
}

export interface Profile {
  name: string | null;
  lastName: string;
  gender: string;
  gitlabUsername: string;
  email: string;
  dietTypes: string[];
  authorities: string[];
}
