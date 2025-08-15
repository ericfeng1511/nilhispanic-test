export interface SchoolContact {
  id: string;
  name: string;
  title: string;
  college: string;
  email: string;
  photo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SchoolContactFilters {
  searchTerm?: string;
  college?: string;
  title?: string;
}

export interface PaginatedSchoolContacts {
  data: SchoolContact[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
