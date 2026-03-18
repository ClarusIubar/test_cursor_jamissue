export default {
  async fetch(request: Request): Promise<Response> {
    return new Response('API Routes Worker', { status: 200 })
  },
}
