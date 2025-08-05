/**
 * Helper functions for API responses
 */

/**
 * Create a JSON response
 */
export function jsonResponse(data: any, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create an error response
 */
export function errorResponse(message: string, status = 400) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Parse query parameters from URL
 */
export function parseQueryParams(url: URL) {
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Parse pagination parameters
 */
export function parsePaginationParams(url: URL) {
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
  
  return {
    page: isNaN(page) ? 1 : Math.max(1, page),
    pageSize: isNaN(pageSize) ? 10 : Math.min(100, Math.max(1, pageSize)),
  };
}
