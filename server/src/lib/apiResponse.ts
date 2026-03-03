import { Response } from 'express';

export interface ApiErrorResponse {
  message: string;
  errors?: { field: string; message: string }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Send a standardized error response.
 */
export const sendError = (
  res: Response,
  status: number,
  message: string,
  errors?: { field: string; message: string }[]
): void => {
  const body: ApiErrorResponse = { message };
  if (errors) body.errors = errors;
  res.status(status).json(body);
};

/**
 * Send a standardized paginated response.
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): void => {
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  res.json(response);
};
