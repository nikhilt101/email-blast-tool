# 📧 Email Blast Tool

Send personalized HTML emails using CSV/XLSX + Gmail SMTP. Open source, MIT.

## Features

- Upload `.csv` / `.xlsx` from the browser
- Extract **Email** + **Name** columns
- Preview the list before sending
- Send HTML emails via Gmail SMTP
- Supports `{{name}}` placeholder in your template
- Test mode to limit sends (first 5 recipients by default)
- Basic rate limiting and send delay to help avoid spam flags

## Quick Start

```bash
git clone https://github.com/nikhilt101/email-blast-tool.git
cd email-blast-tool
npm install
cp .env.example .env   # fill SMTP creds
npm run dev
# open http://localhost:3000 in your browser
```

## CSV/XLSX format

Your upload must include an `Email` column. A `Name` column is optional but recommended for personalization. Column names are case-insensitive, so `email`, `E-Mail`, `FullName`, or `First Name` will all be recognized. Extra columns are ignored.

## Environment

See `.env.example` for all configuration options. To send via Gmail you must enable [two‑factor authentication](https://support.google.com/accounts/answer/185839?hl=en) and create an **App Password**. You may also use any other SMTP provider by filling `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS` accordingly.

## Deliverability & Limits

- Gmail has strict sending limits and spam checks. Use `SEND_DELAY_MS` to throttle sends and avoid bursts.
- The `MAX_PER_BATCH` value limits how many recipients you can send at once (default 200).
- For production campaigns consider a dedicated ESP such as Mailgun, SendGrid, Postmark, or Resend, and configure SPF/DKIM/DMARC on your domain.

## Ethics

Use responsibly. Obtain consent before emailing people, include unsubscribe instructions where required, and comply with laws such as CAN‑SPAM and GDPR.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for the rules of engagement.