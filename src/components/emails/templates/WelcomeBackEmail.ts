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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ilovegithub.oderna.in";


  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Welcome Back to iLoveGithub</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        font-family: 'Courier New', Courier, monospace;
        color: #0d1117;
      }
      .container {
        max-width: 560px;
        margin: 40px auto;
        padding: 24px;
      }
      .header {
        font-size: 20px;
        font-weight: bold;
        color: #ffffff;
        background: #42b6b9;
        padding: 16px;
        text-align: center;
        border-radius: 6px;
      }
      .content {
        margin-top: 24px;
        font-size: 14px;
        line-height: 1.6;
      }
      .button {
        display: inline-block;
        margin-top: 24px;
        background: #2ea44f;
        color: #fff;
        padding: 10px 18px;
        text-decoration: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
      }
      .footer {
        margin-top: 40px;
        font-size: 12px;
        color: #6a737d;
        text-align: center;
      }
      a {
        color: #2ea44f;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">iLoveGithub</div>
      <div class="content">
        <p>Hey ${name},</p>
        <p>It's been ${daysSinceLastLogin} days since your last visit on ${lastLogin} — we've missed you!</p>
        <p>🔥 New trending repositories are waiting for you to discover</p>
        <p>🛠️ Fresh tools to supercharge your GitHub experience</p>
        <p>👨‍💻 A vibrant community continuing to share amazing projects</p>
        <p>We've kept your spot warm. Ready to dive back in?</p>
        <a class="button" href="${appUrl}">Jump Back In →</a>
      </div>
      <div class="footer">
        <p>Sent to ${email}</p>
        <p>© ${year} iLoveGithub</p>
      </div>
    </div>
  </body>
  </html>
  `;

  return html;
};