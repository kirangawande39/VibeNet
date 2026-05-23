const transporter = require('../config/nodemailer');

const SendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    html: `
    <div style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
      
      <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background:#4f46e5; padding:25px; text-align:center;">
          <h1 style="color:#ffffff; margin:0; font-size:28px;">Email Verification</h1>
        </div>

        <!-- Body -->
        <div style="padding:35px; text-align:center;">
          <h2 style="color:#222; margin-bottom:10px;">Your OTP Code</h2>
          <p style="color:#555; font-size:16px; margin-bottom:25px;">
            Use the following One Time Password to verify your email address.
          </p>

          <div style="
            display:inline-block;
            background:#f3f4f6;
            color:#111827;
            font-size:34px;
            font-weight:bold;
            letter-spacing:8px;
            padding:18px 28px;
            border-radius:10px;
            border:2px dashed #4f46e5;
            margin-bottom:25px;
          ">
            ${otp}
          </div>

          <p style="color:#ef4444; font-size:15px; margin-top:10px;">
            Valid for 5 minutes only
          </p>

          <p style="color:#666; font-size:14px; margin-top:25px; line-height:22px;">
            If you did not request this OTP, please ignore this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb; padding:18px; text-align:center; border-top:1px solid #e5e7eb;">
          <p style="margin:0; color:#777; font-size:13px;">
            © 2026 VibeNet. All rights reserved.
          </p>
        </div>

      </div>

    </div>
    `
  });
};

module.exports = SendOTP;