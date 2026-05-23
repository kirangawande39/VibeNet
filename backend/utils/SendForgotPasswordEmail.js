const transporter = require("../config/nodemailer");

const SendForgotPasswordEmail = async (
  email,
  name,
  resetLink
) => {
  // console.log("SendForgotPasswordEmail called")
  await transporter.sendMail({

    from: `"VibeNet Support" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "Reset Your VibeNet Password",

    html: `
    <div style="
      margin:0;
      padding:0;
      background:#f3f4f6;
      font-family:Arial,sans-serif;
    ">

      <div style="
        max-width:600px;
        margin:40px auto;
        background:#ffffff;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 6px 20px rgba(0,0,0,0.08);
      ">

        <!-- Header -->
        <div style="
          background:linear-gradient(135deg,#4f46e5,#7c3aed);
          padding:35px 20px;
          text-align:center;
        ">

          <h1 style="
            margin:0;
            color:#ffffff;
            font-size:32px;
            font-weight:bold;
            letter-spacing:1px;
          ">
            VibeNet
          </h1>

          <p style="
            margin-top:10px;
            color:#e0e7ff;
            font-size:15px;
          ">
            Secure Password Reset
          </p>

        </div>

        <!-- Body -->
        <div style="
          padding:40px 35px;
          text-align:center;
        ">

          <h2 style="
            color:#111827;
            margin-bottom:15px;
            font-size:28px;
          ">
            Forgot Your Password?
          </h2>

          <p style="
            color:#4b5563;
            font-size:16px;
            line-height:28px;
            margin-bottom:25px;
          ">
            Hi <b>${name}</b>, <br/>
            We received a request to reset your password.
            Click the button below to create a new one.
          </p>

          <!-- Button -->
          <a
            href="${resetLink}"
            style="
              display:inline-block;
              background:linear-gradient(135deg,#4f46e5,#7c3aed);
              color:#ffffff;
              text-decoration:none;
              padding:16px 38px;
              border-radius:10px;
              font-size:16px;
              font-weight:bold;
              margin-top:10px;
            "
          >
            Reset Password
          </a>

          <p style="
            color:#ef4444;
            font-size:14px;
            margin-top:28px;
          ">
            This reset link will expire in 10 minutes.
          </p>

          <div style="
            margin-top:35px;
            background:#f9fafb;
            border:1px solid #e5e7eb;
            border-radius:10px;
            padding:18px;
            word-break:break-all;
          ">

            <p style="
              margin:0 0 10px 0;
              color:#6b7280;
              font-size:14px;
            ">
              If the button does not work,
              copy and paste this link:
            </p>

            <a
              href="${resetLink}"
              style="
                color:#4f46e5;
                font-size:14px;
                text-decoration:none;
              "
            >
              ${resetLink}
            </a>

          </div>

          <p style="
            color:#6b7280;
            font-size:14px;
            line-height:24px;
            margin-top:35px;
          ">
            If you did not request a password reset,
            you can safely ignore this email.
          </p>

        </div>

        <!-- Footer -->
        <div style="
          background:#f9fafb;
          border-top:1px solid #e5e7eb;
          padding:20px;
          text-align:center;
        ">

          <p style="
            margin:0;
            color:#6b7280;
            font-size:13px;
          ">
            © 2026 VibeNet. All rights reserved.
          </p>

          <p style="
            margin-top:8px;
            color:#9ca3af;
            font-size:12px;
          ">
            This is an automated message, please do not reply.
          </p>

        </div>

      </div>

    </div>
    `
  });

};

module.exports = SendForgotPasswordEmail;