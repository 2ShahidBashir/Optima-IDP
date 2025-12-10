/**
 * EMAIL TEMPLATES UTILITY
 * ----------------------------------------------------------------------
 * Provides functions to generate consistent, designated HTML email content.
 * Uses a base responsive layout with header and footer.
 */

const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f9;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* Primary to Secondary Gradient */
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 32px 24px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .button {
      display: inline-block;
      background-color: #764ba2; /* Secondary Purple */
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 20px;
      box-shadow: 0 4px 6px rgba(118, 75, 162, 0.3);
      transition: background-color 0.3s ease;
    }
    .button:hover {
      background-color: #667eea;
    }
    .highlight {
      font-weight: 700;
      color: #764ba2;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Optima IDP</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Optima IDP. All rights reserved.</p>
      <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

// Helper to get frontend URL
const getFrontendUrl = () => {
    return (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
};

/**
 * WELCOME EMAIL (Admin or Employee)
 */
const getWelcomeEmail = (name, company, role) => {
    const isAdmin = role === 'admin';
    const dashboardLink = `${getFrontendUrl()}/login`;

    const content = isAdmin
        ? `
      <h2>Welcome, Admin!</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>You have successfully registered your company, <span class="highlight">${company}</span>, on Optima IDP.</p>
      <p>As an Admin, you have full control over your organization's settings. You can now:</p>
      <ul>
        <li>Invite and manage employees</li>
        <li>Configure security settings (2FA, Password Policies)</li>
        <li>Monitor team performance and audits</li>
      </ul>
      <p>Get started by logging in and setting up your organization's profile.</p>
      <center><a href="${dashboardLink}" class="button">Go to Dashboard</a></center>
    `
        : `
      <h2>Welcome to the Team!</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>You have successfully joined <span class="highlight">${company}</span> on Optima IDP.</p>
      <p>We are excited to help you grow. Here is what you can do:</p>
      <ul>
        <li>View your personalized learning path</li>
        <li>Track your skill development goals</li>
        <li>Access recommended resources</li>
      </ul>
      <p>Log in now to start your journey.</p>
      <center><a href="${dashboardLink}" class="button">Start Learning</a></center>
    `;

    return getBaseTemplate(content);
};

/**
 * MANAGER PROMOTION EMAIL
 */
const getManagerPromotionEmail = (name) => {
    const dashboardLink = `${getFrontendUrl()}/dashboard`; // Assuming authorized users go straight to dashboard

    const content = `
    <h2>Congratulations, Manager!</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Great news! You have been promoted to the <span class="highlight">Manager</span> role.</p>
    <p>This new role gives you additional responsibilities and tools:</p>
    <ul>
      <li>Oversee your team's progress</li>
      <li>Assign goals and development plans</li>
      <li>View team analytics and reports</li>
    </ul>
    <p>Thank you for your leadership and dedication.</p>
    <center><a href="${dashboardLink}" class="button">View Team Dashboard</a></center>
  `;
    return getBaseTemplate(content);
};

/**
 * PASSWORD RESET EMAIL
 */
const getPasswordResetEmail = (resetUrl) => {
    const content = `
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password for your Optima IDP account.</p>
    <p>If you didn't ask for this, you can safely ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <center><a href="${resetUrl}" class="button">Reset Password</a></center>
    <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
      Or copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #7c3aed;">${resetUrl}</a>
    </p>
    <p>This link expires in 1 hour.</p>
  `;
    return getBaseTemplate(content);
};

module.exports = {
    getWelcomeEmail,
    getManagerPromotionEmail,
    getPasswordResetEmail
};
