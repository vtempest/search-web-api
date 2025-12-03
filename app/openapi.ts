export const openAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'SearXNG HonoX API',
    version: '0.1.0',
    description: 'A search aggregator API built with Hono that queries multiple search engines and returns unified results.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  paths: {
    '/search': {
      get: {
        summary: 'Search across multiple engines',
        description: 'Performs a search query across multiple search engines and returns unified results.',
        operationId: 'search',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            description: 'The search query string',
            schema: {
              type: 'string',
              example: 'typescript tutorial',
            },
          },
          {
            name: 'format',
            in: 'query',
            required: false,
            description: 'Response format (currently only JSON is supported)',
            schema: {
              type: 'string',
              enum: ['json'],
              default: 'json',
            },
          },
          {
            name: 'pageno',
            in: 'query',
            required: false,
            description: 'Page number for pagination (starts at 1)',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
          },
          {
            name: 'engines',
            in: 'query',
            required: false,
            description: 'Comma-separated list of engine names to use for search',
            schema: {
              type: 'string',
              example: 'google,bing,duckduckgo',
            },
          },
          {
            name: 'categories',
            in: 'query',
            required: false,
            description: 'Comma-separated list of categories to filter engines',
            schema: {
              type: 'string',
              example: 'general,images',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful search response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    query: {
                      type: 'string',
                      description: 'The search query that was executed',
                      example: 'typescript tutorial',
                    },
                    results: {
                      type: 'array',
                      description: 'Array of search results from various engines',
                      items: {
                        $ref: '#/components/schemas/EngineResult',
                      },
                    },
                  },
                  required: ['query', 'results'],
                },
              },
            },
          },
          '400': {
            description: 'Bad request - missing or invalid parameters',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      EngineResult: {
        type: 'object',
        description: 'A single search result from an engine',
        properties: {
          url: {
            type: 'string',
            description: 'URL of the result',
            example: 'https://example.com/article',
          },
          link: {
            type: 'string',
            description: 'Alternative link field for the result',
            example: 'https://example.com/article',
          },
          title: {
            type: 'string',
            description: 'Title of the search result',
            example: 'TypeScript Tutorial - Learn TypeScript',
          },
          content: {
            type: 'string',
            description: 'Content or description of the search result',
            example: 'A comprehensive guide to TypeScript programming...',
          },
          thumbnail: {
            type: 'string',
            description: 'URL to a thumbnail image (if available)',
            example: 'https://example.com/thumb.jpg',
          },
          engine: {
            type: 'string',
            description: 'Name of the engine that provided this result',
            example: 'google',
          },
        },
        required: ['title', 'content'],
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
            example: 'Missing query parameter',
          },
        },
        required: ['error'],
      },
    },
  },
};

