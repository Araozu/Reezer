interface IPaginationInfo {
  current_page: number,
  page_size: number,
  total_items: number,
  total_pages: number,
  has_next: boolean,
  has_prev: boolean,
}

export interface IPaginatedResult<T> {
  data: T[];
  pagination: IPaginationInfo
}

export interface IPaginationOptions {
  limit?: number;
  pageNumber?: string;
}
