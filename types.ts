export interface ShrinkmeSuccessResponse {
  status: 'success';
  shortenedUrl: string;
}

export interface ShrinkmeErrorResponse {
  status: 'error';
  message: string;
}

export type ShrinkmeResponse = ShrinkmeSuccessResponse | ShrinkmeErrorResponse;
