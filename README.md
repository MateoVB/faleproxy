# Faleproxy

A proxy service that replaces instances of "Yale" with "Fale" in web content, while preserving URLs and maintaining case sensitivity.

## Features

- Replaces "Yale" with "Fale" while preserving case (Yale -> Fale, YALE -> FALE, yale -> fale)
- Preserves yale.edu URLs and email addresses
- Supports HTML content with proper DOM parsing
- Full test coverage with unit and integration tests
- CI/CD pipeline with GitHub Actions and Vercel deployment

## Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Usage

1. Start the server:

```bash
npm start
```

2. Open a browser and go to `http://localhost:3001`
3. Enter a URL in the input field (e.g., https://www.yale.edu)
4. Click "Fetch & Replace" to see the modified content

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## API

### POST /fetch

Fetches content from a URL and replaces Yale references with Fale.

Request body:
```json
{
  "url": "https://example.com"
}
```

Response:
```json
{
  "success": true,
  "content": "...", // Modified HTML content
  "title": "...",   // Modified page title
  "originalUrl": "https://example.com"
}
```

## Testing

The application includes a comprehensive test suite:

- **Unit tests**: Test the Yale-to-Fale replacement logic
- **API tests**: Test the application endpoints
- **Integration tests**: Test the entire application workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage for CI/CD
npm run test:ci
```

## CI/CD Pipeline

The repository includes a GitHub Actions workflow configuration in `.github/workflows/ci.yml` that:

1. Runs on pushes to main/master branches and on pull requests
2. Tests the application on multiple Node.js versions (18.x, 20.x)
3. Generates and uploads test coverage reports
4. Automatically deploys to Vercel (when pushing to main/master)

### Setting up Vercel Deployment

To enable automatic deployments to Vercel, you need to:

1. Create a Vercel account and link your repository
2. Create a Vercel project for your application
3. Generate a Vercel token and add it as a secret in your GitHub repository:
   - Go to Settings → Secrets → Actions
   - Add a new secret named `VERCEL_TOKEN` with your Vercel token

## Technologies Used

- Node.js
- Express - Web server framework
- Axios - HTTP client for fetching web pages
- Cheerio - HTML parsing and manipulation
- Vanilla JavaScript for frontend functionality
- Jest, Supertest, and Nock for testing

## License

MIT
