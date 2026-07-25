export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background-color: #2c3e50;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      background-color: #ffffff;
    }
    .verification-code {
      display: block;
      width: fit-content;
      margin: 30px auto;
      padding: 15px 30px;
      background-color: #f8f9fa;
      border: 2px dashed #3498db;
      border-radius: 8px;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 5px;
      color: #2c3e50;
      text-align: center;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #eee;
    }
    p {
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <p>Hello,{fullName}</p>
      <p>Thank you for registering with the FYP Coordination System. To complete your registration, please use the verification code below:</p>
      
      <div class="verification-code">{verificationCode}</div>
      
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>FYP Coordination Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply.</p>
      <p>&copy; ${new Date().getFullYear()} FYP Coordination System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background-color: #2c3e50;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      background-color: #ffffff;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #3498db;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 25px 0;
      text-align: center;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #eee;
    }
    p {
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello,{fullName}</p>
      <p>We received a request to reset your password for your FYP Coordination System account. If you didn't make this request, you can safely ignore this email.</p>
      
      <div style="text-align: center;">
        <a href="{resetURL}" class="button">Reset Password</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #3498db; font-size: 14px;">{resetURL}</p>
      
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>FYP Coordination Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply.</p>
      <p>&copy; ${new Date().getFullYear()} FYP Coordination System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background-color: #27ae60; /* Success Green */
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      background-color: #ffffff;
    }
    .icon-circle {
      width: 60px;
      height: 60px;
      background-color: #e8f8f5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .check-icon {
      color: #27ae60;
      font-size: 30px;
      font-weight: bold;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #eee;
    }
    p {
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Successful</h1>
    </div>
    <div class="content">
      <div class="icon-circle">
        <span class="check-icon">✓</span>
      </div>
      <p style="text-align: center;">Hello,{fullName}</p>
      <p style="text-align: center;">Your password has been successfully reset. You can now log in with your new password.</p>
      
      <p style="text-align: center; margin-top: 30px;">
        If you did not perform this action, please contact support immediately.
      </p>
      
      <p style="text-align: center;">Best regards,<br>FYP Coordination Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply.</p>
      <p>&copy; ${new Date().getFullYear()} FYP Coordination System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const VERIFICATION_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Verified Successfully</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background-color: #27ae60; /* Success Green */
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      background-color: #ffffff;
    }
    .icon-circle {
      width: 60px;
      height: 60px;
      background-color: #e8f8f5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .check-icon {
      color: #27ae60;
      font-size: 30px;
      font-weight: bold;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #eee;
    }
    p {
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Account Verified</h1>
    </div>
    <div class="content">
      <div class="icon-circle">
        <span class="check-icon">✓</span>
      </div>
      <p style="text-align: center;">Hello, {fullName}</p>
      <p style="text-align: center;">Your email address has been successfully verified! Your account is now active and you can log in to the FYP Coordination System.</p>
      
      <p style="text-align: center; margin-top: 30px;">
        Welcome aboard! We are excited to have you with us.
      </p>
      
      <p style="text-align: center;">Best regards,<br>FYP Coordination Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply.</p>
      <p>&copy; ${new Date().getFullYear()} FYP Coordination System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
