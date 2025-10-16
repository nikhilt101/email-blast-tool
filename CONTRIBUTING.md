# Contributing

Thanks for your interest in contributing to the Email Blast Tool! 🎉

## Dev Setup

- Node 18 or newer is recommended.
- Clone the repository and install dependencies via `npm install`.
- Copy `.env.example` to `.env` and fill in the required values.
- Run `npm run dev` to start the server in development mode.

## Code Style

- Keep changes small and focused.
- Write descriptive commit messages prefaced with `feat:`, `fix:`, `docs:`, etc.
- Add comments for non‑obvious logic and avoid large functions—prefer small, pure functions.

## Testing

- Use `testMode` when sending emails during development. This will restrict sending to the first five recipients and is enabled by default in the UI.
- Provide sample CSV and XLSX files in the `/samples` directory to help with testing.

## Pull Requests

1. Fork this repository and create a feature branch (`feat/your-feature`, `fix/your-fix`).
2. Make your changes with appropriate tests, if applicable.
3. Open a pull request with a clear description of what you changed and why. Include screenshots or recordings if you updated the UI.

## Security

Never commit sensitive data such as passwords, API keys, or private user information. If you discover a security vulnerability, please report it privately via email or a GitHub security advisory.