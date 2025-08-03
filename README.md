# 📧 Email Blast Tool

Send personalized HTML emails using Gmail SMTP by uploading a `.csv` or `.xlsx` with emails and names.

## 🌟 Features

- Upload `.csv`/`.xlsx` from browser
- Extract email + name
- Show all emails in a textarea
- Send HTML emails using Gmail SMTP
- Editable HTML template with `{{name}}` placeholder

## 🛠 Tech Stack

- Node.js + Express
- Multer for uploads
- xlsx for parsing
- Nodemailer for emails
- dotenv for environment config

## 🚀 Getting Started

```bash
git clone https://github.com/nikhilt101/email-blast-tool.git
cd email-blast-tool
npm install
cp .env.example .env
# Add your Gmail credentials in .env
node server.js
