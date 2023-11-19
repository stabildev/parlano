/**
 * Handle CORS preflight requests and OPTIONS requests.
 */

export const handleOptions = (request: Request): Response => {
	let headers = request.headers;

	// Make sure the necessary headers are present for this to be a valid preflight request
	if (headers.get('Origin') !== null && headers.get('Access-Control-Request-Method') !== null) {
		// Handle CORS preflight request
		let respHeaders = new Headers({
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
			'Access-Control-Allow-Headers': headers.get('Access-Control-Request-Headers') ?? '',
		});

		return new Response(null, {
			headers: respHeaders,
		});
	} else {
		// Handle standard OPTIONS request
		return new Response(null, {
			headers: {
				Allow: 'GET, POST, HEAD, OPTIONS',
			},
		});
	}
};

/**
 * CORS headers to add to every response.
 */

export const corsHeaders = new Headers({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': '*',
});
