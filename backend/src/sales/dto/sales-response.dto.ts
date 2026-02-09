import { Sale } from '../../database/entities';

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SalesFindAllResponseDto {
  data: Sale[];
  pagination: Pagination;
  totalSales: number;                                                     
  totalItems: number;                                                                   
}
