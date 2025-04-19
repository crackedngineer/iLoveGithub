export const generateWelcomeBackEmail = ({
  name,
  email,
  lastLogin,
  daysSinceLastLogin,
}: {
  name: string;
  email: string;
  lastLogin: string;
  daysSinceLastLogin: number;
}) => {
  const year = new Date().getFullYear();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-app-url.com";

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Welcome Back to iLoveGithub!</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
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
      }
      .container {
        background-color: #ffffff;
        padding: 30px 20px;
        color: #24292e;
        font-size: 16px;
        line-height: 1.5;
      }
      .button {
        display: inline-block;
        background-color: #2ea44f;
        color: #ffffff;
        font-weight: bold;
        border-radius: 6px;
        padding: 12px 24px;
        text-decoration: none;
        margin: 20px 0;
      }
      .footer {
        background-color: #f6f8fa;
        font-size: 12px;
        color: #6a737d;
        text-align: center;
        padding: 20px;
      }
      a {
        color: #0366d6;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="header">Welcome Back to iLoveGithub!</div>

    <div class="container">
      <p>Hi ${name},</p>
      <p>It's great to see you again! You last visited <strong>${daysSinceLastLogin}</strong> days ago on <strong>${lastLogin}</strong>.</p>
      <p>We’ve added some exciting new features:</p>
      <ul>
        <li>Discover trending repositories</li>
        <li>Enhanced user profiles</li>
        <li>Improved search functionality</li>
        <li>Community highlights and spotlights</li>
      </ul>
      <a href="${appUrl}/dashboard" class="button">Back to Dashboard</a>

      <p style="margin-top: 20px;">
        We’ve also curated a selection of personalized projects just for you. Check them out when you log back in.
      </p>
      <p>Happy to have you back!</p>
      <p style="padding-top: 30px;">– The iLoveGithub Team</p>
    </div>

    <div class="footer">
      <p>This email was sent to ${email}.</p>
      <p>
        To stop receiving these emails, 
        <a href="${appUrl}/settings/notifications">update your preferences</a>.
      </p>
      <p>© ${year} iLoveGithub. All rights reserved.</p>
    </div>
  </body>
  </html>
  `;

  return html;
};
