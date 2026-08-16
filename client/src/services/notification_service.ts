import toast from "react-hot-toast";
import { axiosInstance } from "../utils/api_request/utils";

export interface NotifyPayload {
    phone?: string;
    email?: string;
    name?: string;
    message: string;
    subject?: string;
    htmlBody?: string;
}

/** Send SMS via backend Twilio proxy (no-op if SMS disabled) */
export const sendSms = async (payload: NotifyPayload): Promise<void> => {
    if (!payload.phone) return;

    const smsEnabled = import.meta.env.VITE_TWILIO_SMS_ENABLED === "true";
    if (smsEnabled) {
        try {
            await axiosInstance.post("/notify/sms", {
                phone: payload.phone,
                message: payload.message,
            });
        } catch {
            console.warn("SMS send failed");
        }
    } else {
        // Mock: log what would be sent
        console.info(`[MOCK SMS → ${payload.phone}]: ${payload.message}`);
    }
};

/** Send Email via backend Resend proxy (no-op if email disabled) */
export const sendEmail = async (payload: NotifyPayload): Promise<void> => {
    if (!payload.email) return;

    const emailEnabled = import.meta.env.VITE_RESEND_EMAIL_ENABLED === "true";
    if (emailEnabled) {
        try {
            await axiosInstance.post("/notify/email", {
                to: payload.email,
                subject: payload.subject || "NGO Notification",
                html: payload.htmlBody || `<p>${payload.message}</p>`,
            });
        } catch {
            console.warn("Email send failed");
        }
    } else {
        console.info(
            `[MOCK EMAIL → ${payload.email}] ${payload.subject}: ${payload.message}`,
        );
    }
};

/**
 * Notify BOTH user and admin after an approve/reject action.
 * Fires 4 notifications in parallel: SMS + Email × 2 people.
 */
export const notifyBoth = async (params: {
    user: { phone?: string; email?: string; name: string };
    admin: { phone?: string; email?: string; name: string };
    userMsg: string;
    adminMsg: string;
    subject: string;
    userHtml?: string;
    adminHtml?: string;
}): Promise<void> => {
    const { user, admin, userMsg, adminMsg, subject, userHtml, adminHtml } =
        params;

    await Promise.allSettled([
        sendSms({ phone: user.phone, message: userMsg }),
        sendEmail({
            email: user.email,
            subject,
            message: userMsg,
            htmlBody: userHtml,
        }),
        sendSms({ phone: admin.phone, message: adminMsg }),
        sendEmail({
            email: admin.email,
            subject: `[Admin] ${subject}`,
            message: adminMsg,
            htmlBody: adminHtml,
        }),
    ]);

    toast.success("Notifications sent to user and admin");
};

/** Helper: build approval messages for ID card */
export const buildIdCardApprovalMessages = (params: {
    userName: string;
    cardNumber: string;
    designation: string;
}) => ({
    userMsg: `Hi ${params.userName}, your NGO ID card request has been approved! Your card number is ${params.cardNumber}. Designation: ${params.designation}. Login to download your ID card.`,
    adminMsg: `ID card approved for ${params.userName} (${params.designation}) — Card #${params.cardNumber}.`,
    subject: "NGO ID Card Request Approved",
    userHtml: `
    <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
      <div style="background:#059669;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#fff;margin:0;font-size:20px;">ID Card Approved ✓</h2>
      </div>
      <p style="color:#334155;">Hi <strong>${params.userName}</strong>,</p>
      <p style="color:#334155;">Your NGO ID card request has been <strong style="color:#059669;">approved</strong>.</p>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;color:#64748b;font-size:14px;">Card Number: <strong style="color:#0f172a;">${params.cardNumber}</strong></p>
        <p style="margin:4px 0;color:#64748b;font-size:14px;">Designation: <strong style="color:#0f172a;">${params.designation}</strong></p>
      </div>
      <p style="color:#64748b;font-size:14px;">Login to the portal to download your ID card.</p>
    </div>
  `,
});

/** Helper: build rejection messages for ID card */
export const buildIdCardRejectionMessages = (params: {
    userName: string;
    reason: string;
}) => ({
    userMsg: `Hi ${params.userName}, your NGO ID card request has been declined.\nReason: ${params.reason}.\nPlease reapply with updated details.`,
    adminMsg: `ID card rejected for ${params.userName}. Reason: ${params.reason}.`,
    subject: "NGO ID Card Request Update",
    userHtml: `
    <div style="font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#0f172a;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
        <h2 style="color:#ffffff;margin:0;font-size:18px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">NGO Platform</h2>
      </div>
      <div style="background:#ffffff;padding:28px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="display:inline-block;background:#fee2e2;color:#dc2626;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">
          Application Update
        </div>
        <h3 style="color:#0f172a;margin:0 0 16px 0;font-size:20px;font-weight:700;">ID Card Request Declined</h3>
        <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 12px 0;">Hi <strong>${params.userName}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
          Thank you for your interest in volunteering with us. We reviewed your ID card request, but were unable to approve the application with the current details.
        </p>
        <div style="background:#fff1f2;border-left:4px solid #e11d48;border-radius:6px;padding:14px 16px;margin:20px 0;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#be123c;margin-bottom:4px;">Reason for Rejection</div>
          <div style="font-size:14px;color:#1e293b;font-weight:600;line-height:1.5;">${params.reason}</div>
        </div>
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px 0;">
          You are welcome to reapply with updated information and a clear passport photo.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="/id-card/generate" style="display:inline-block;background:#059669;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;box-shadow:0 2px 4px rgba(5,150,105,0.2);">Reapply for ID Card →</a>
        </div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">NGO Platform</p>
      </div>
    </div>
  `,
});

/** Helper: build approval messages for donation */
export const buildDonationApprovalMessages = (params: {
    donorName: string;
    amount: string;
}) => ({
    userMsg: `Hi ${params.donorName}, thank you! Your donation of ${params.amount} has been verified. A certificate has been issued. Login to download your donation certificate.`,
    adminMsg: `Donation approved for ${params.donorName} — ${params.amount}.`,
    subject: "Donation Receipt Verified — Certificate Issued",
    userHtml: `
    <div style="font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#059669;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
        <h2 style="color:#ffffff;margin:0;font-size:18px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">NGO Platform</h2>
      </div>
      <div style="background:#ffffff;padding:28px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="display:inline-block;background:#d1fae5;color:#065f46;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">
          Verified ✓
        </div>
        <h3 style="color:#0f172a;margin:0 0 16px 0;font-size:20px;font-weight:700;">Donation Verified</h3>
        <p style="color:#334155;font-size:15px;margin-top:0;">Dear <strong>${params.donorName}</strong>,</p>
        <p style="color:#334155;font-size:14px;line-height:1.6;">Your generous donation of <strong style="color:#059669;font-size:16px;">${params.amount}</strong> has been <strong style="color:#059669;">verified</strong>.</p>
        <p style="color:#334155;font-size:14px;">Your donation certificate is ready to download.</p>
        <p style="color:#334155;font-size:13px;margin-top:20px;">Thank you for supporting our mission! 🙏</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">NGO Platform</p>
      </div>
    </div>
  `,
});

/** Helper: build rejection messages for donation */
export const buildDonationRejectionMessages = (params: {
    donorName: string;
    amount: string;
    reason: string;
}) => ({
    userMsg: `Hi ${params.donorName}, your donation receipt for ${params.amount} could not be verified.\nReason: ${params.reason}.\nPlease resubmit with a clear screenshot.`,
    adminMsg: `Donation rejected for ${params.donorName} — ${params.amount}. Reason: ${params.reason}.`,
    subject: "Donation Receipt — Action Required",
    userHtml: `
    <div style="font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#0f172a;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
        <h2 style="color:#ffffff;margin:0;font-size:18px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">NGO Platform</h2>
      </div>
      <div style="background:#ffffff;padding:28px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="display:inline-block;background:#fee2e2;color:#dc2626;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">
          Verification Update
        </div>
        <h3 style="color:#0f172a;margin:0 0 16px 0;font-size:20px;font-weight:700;">Receipt Verification Failed</h3>
        <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 12px 0;">Dear <strong>${params.donorName}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
          Thank you for your intention to support our mission. We reviewed your recent donation request of <strong>${params.amount}</strong>, but were unable to verify the transaction receipt.
        </p>
        <div style="background:#fff1f2;border-left:4px solid #e11d48;border-radius:6px;padding:14px 16px;margin:20px 0;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#be123c;margin-bottom:4px;">Reason for Rejection</div>
          <div style="font-size:14px;color:#1e293b;font-weight:600;line-height:1.5;">${params.reason}</div>
        </div>
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px 0;">
          Please resubmit with a clear, complete payment screenshot (showing the UTR/Reference number and transaction date).
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="/donate" style="display:inline-block;background:#059669;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;box-shadow:0 2px 4px rgba(5,150,105,0.2);">Submit New Donation Proof →</a>
        </div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">NGO Platform</p>
      </div>
    </div>
  `,
});
