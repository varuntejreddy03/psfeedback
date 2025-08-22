export interface ProjectData {
  "S.No": number
  "Group Name": string
  "Project Title": string
  "Roll Number": string
  "Student Name": string
  "Mentor(s)": string
}

export interface ProjectConcern {
  id: string
  created_at: string
  group_number: string
  project_title: string
  student_names: string
  mentor_name: string
  concern_description: string
  preferred_mentor: "Srikanth" | "Sanjana"
}

export interface ConcernFormData {
  project_title: string
  concern_description: string
  preferred_mentor: "Srikanth" | "Sanjana"
}
