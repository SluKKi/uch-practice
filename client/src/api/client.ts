const BASE_URL = '';

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string>;

  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers = {}, ...customConfig } = options;

  const token = localStorage.getItem('token');
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = responseData?.message || `Ошибка сервера (${response.status})`;
    throw new ApiError(response.status, errorMessage, responseData?.errors);
  }

  return responseData as T;
}
