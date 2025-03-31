const axios = require('axios');
const cheerio = require('cheerio');
const { sampleHtmlWithYale } = require('./test-utils');
const nock = require('nock');
const express = require('express');
const app = require('../app');

// Set a different port for testing to avoid conflict with the main app
const TEST_PORT = 3099;
let server;

describe('Integration Tests', () => {
  beforeAll(async () => {
    // Mock external HTTP requests
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
    
    // Create a test server
    const testApp = express();
    testApp.use(express.json());
    testApp.use('/', app);
    
    // Start the test server
    server = testApp.listen(TEST_PORT);
    
    // Give the server time to start
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, 10000); // Increase timeout for server startup

  afterAll(async () => {
    // Close the test server
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test('Should replace Yale with Fale in fetched content', async () => {
    const mockResponse = sampleHtmlWithYale.replace(/Yale(?!\.edu)/g, 'Fale')
                                         .replace(/YALE(?!\.edu)/g, 'FALE')
                                         .replace(/yale(?!\.edu)/g, 'fale');
    
    // Setup mock for example.com
    nock('https://example.com')
      .get('/')
      .reply(200, sampleHtmlWithYale);
    
    // Make a request to our proxy app
    const response = await axios.post(`http://localhost:${TEST_PORT}/fetch`, {
      url: 'https://example.com/'
    });
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    
    // Verify Yale has been replaced with Fale in text
    const $ = cheerio.load(response.data.content);
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
    try {
      await axios.post(`http://localhost:${TEST_PORT}/fetch`, {
        url: 'not-a-valid-url'
      });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });

  test('Should handle missing URL parameter', async () => {
    try {
      await axios.post(`http://localhost:${TEST_PORT}/fetch`, {});
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toBe('URL is required');
    }
  });
});
