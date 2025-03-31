const cheerio = require('cheerio');
const { sampleHtmlWithYale } = require('./test-utils');
const nock = require('nock');
const app = require('../app');
const request = require('supertest');

// Set a different port for testing
const TEST_PORT = 3099;
let server;

describe('Integration Tests', () => {
  beforeAll(async () => {
    // Mock external HTTP requests
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
    
    // Start the test server
    server = app.listen(TEST_PORT);
  });

  afterAll(async () => {
    // Close the test server
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test('Should replace Yale with Fale in fetched content', async () => {
    // Setup mock for example.com
    nock('https://example.com')
      .get('/')
      .reply(200, sampleHtmlWithYale);
    
    // Use supertest instead of axios
    const response = await request(app)
      .post('/fetch')
      .send({ url: 'https://example.com/' })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    
    // Verify Yale has been replaced with Fale in text
    const $ = cheerio.load(response.body.content);
    expect($('title').text()).toBe('Fale University Test Page');
    expect($('h1').text()).toBe('Welcome to Fale University');
    expect($('p').first().text()).toContain('Fale University is a private');
    
    // Verify URLs remain unchanged
    const links = $('a');
    let hasYaleUrl = false;
    links.each((i, link) => {
      const href = $(link).attr('href');
      if (href && href.includes('yale.edu')) {
        hasYaleUrl = true;
      }
    });
    expect(hasYaleUrl).toBe(true);
    
    // Verify link text is changed
    expect($('a').first().text()).toBe('About Fale');
  });

  test('Should handle invalid URLs', async () => {
    await request(app)
      .post('/fetch')
      .send({ url: 'not-a-valid-url' })
      .expect(500);
  });

  test('Should handle missing URL parameter', async () => {
    const response = await request(app)
      .post('/fetch')
      .send({})
      .expect(400);
    
    expect(response.body.error).toBe('URL is required');
  });
});
