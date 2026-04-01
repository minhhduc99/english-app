export interface Student {
  id: string;
  studentId: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  class: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
}
