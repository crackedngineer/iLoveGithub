export const generateWelcomeEmail = ({
  name,
  email,
}: {
  name: string;
  email: string;
}) => {
  const year = new Date().getFullYear();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://ilovegithub.oderna.in";
  const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(
    email
  )}`;
  const newsletterUrl = `${appUrl}/newsletter`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Welcome to iLoveGitHub</title>
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
      .version {
        font-size: 12px;
        font-weight: normal;
        opacity: 0.8;
        margin-left: 4px;
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
      <div class="header">iLoveGitHub</div>
      <div class="content">
        <p>Hello ${name}!</p>
        <p>Welcome to <strong>iLoveGitHub</strong> — your new favorite way to discover GitHub's hidden gems.</p>
        <p>🚀 Find trending repositories</p>
        <p>🔍 Discover tools to enhance your GitHub experience</p>
        <p>👨‍💻 A vibrant community continuing to share amazing projects</p>
        <p>We're excited to have you join our community of GitHub enthusiasts!</p>
        <a class="button" href="${appUrl}">Explore Now →</a>
      </div>
      <div class="footer">
        <p>Sent to ${email}</p>
        <p>© ${year} iLoveGitHub</p>
      </div>
    </div>
  </body>
  </html>
  `;

  return html;
};
