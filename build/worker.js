export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Try to serve the static asset
        const asset = await env.ASSETS.fetch(request);

        // If asset found, return it
        if (asset.status !== 404) {
            return asset;
        }

        // For SPA: if not found and not a file extension, serve index.html
        if (!url.pathname.includes('.')) {
            const indexRequest = new Request(new URL('/index.html', request.url), request);
            return env.ASSETS.fetch(indexRequest);
        }

        // Otherwise return the 404
        return asset;
    }
}
