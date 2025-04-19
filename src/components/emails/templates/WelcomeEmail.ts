interface WelcomeEmailProps {
  name: string;
  email: string;
}

export function generateWelcomeEmail({
  name,
  email,
}: WelcomeEmailProps): string {
  const year = new Date().getFullYear();

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Welcome Email</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
      }
      .header {
        background-color: #24292e;
        color: #ffffff;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        padding: 20px;
        border-radius: 5px 5px 0 0;
      }
      .content {
        padding: 30px 20px;
        color: #24292e;
        font-size: 16px;
        line-height: 1.5;
      }
      .content ul {
        padding-left: 20px;
      }
      .button {
        display: inline-block;
        background-color: #2ea44f;
        color: #ffffff;
        font-weight: bold;
        border-radius: 6px;
        padding: 12px 20px;
        text-decoration: none;
        margin: 20px 0;
      }
      .footer {
        background-color: #f6f8fa;
        font-size: 12px;
        color: #6a737d;
        text-align: center;
        padding: 15px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      Welcome to iLoveGithub!
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>Thank you for joining iLoveGithub! We're excited to have you as part of our community.</p>
      <p>With iLoveGithub, you can:</p>
      <ul>
        <li>Discover interesting GitHub repositories</li>
        <li>Share your favorite projects</li>
        <li>Connect with other developers</li>
        <li>Stay updated on the latest trends</li>
      </ul>
      <a href="${
        process.env.NEXT_PUBLIC_APP_URL || "https://your-app-url.com"
      }/dashboard" class="button">Explore Now</a>
      <p>If you have any questions or feedback, feel free to reply to this email.</p>
      <p>Happy coding!</p>
      <p style="padding-top: 30px;">The iLoveGithub Team</p>
    </div>
    <div class="footer">
      <p>This email was sent to ${email}</p>
      <p>© ${year} iLoveGithub. All rights reserved.</p>
    </div>
  </body>
  </html>
  `;

  return html;
}
