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
    userMsg: `Hi ${params.userName}, unfortunately your NGO ID card request has been declined. Reason: ${params.reason}. Please reapply with the correct details.`,
    adminMsg: `ID card rejected for ${params.userName}. Reason: ${params.reason}.`,
    subject: "NGO ID Card Request Update",
    userHtml: `
    <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
      <div style="background:#dc2626;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#fff;margin:0;font-size:20px;">ID Card Request Declined</h2>
      </div>
      <p style="color:#334155;">Hi <strong>${params.userName}</strong>,</p>
      <p style="color:#334155;">We were unable to process your ID card request at this time.</p>
      <div style="background:#fff;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#dc2626;font-size:14px;">Reason: <strong>${params.reason}</strong></p>
      </div>
      <p style="color:#64748b;font-size:14px;">Please reapply with the correct information. Contact us if you need help.</p>
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
    <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
      <div style="background:#059669;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#fff;margin:0;font-size:20px;">Donation Verified ✓</h2>
      </div>
      <p style="color:#334155;">Dear <strong>${params.donorName}</strong>,</p>
      <p style="color:#334155;">Your generous donation of <strong style="color:#059669;">${params.amount}</strong> has been verified.</p>
      <p style="color:#334155;">Your donation certificate is ready to download. Please login to the portal.</p>
      <p style="color:#64748b;font-size:13px;margin-top:16px;">Thank you for supporting our mission! 🙏</p>
    </div>
  `,
});

/** Helper: build rejection messages for donation */
export const buildDonationRejectionMessages = (params: {
    donorName: string;
    amount: string;
    reason: string;
}) => ({
    userMsg: `Hi ${params.donorName}, your donation receipt for ${params.amount} could not be verified. Reason: ${params.reason}. Please resubmit with a clear screenshot.`,
    adminMsg: `Donation rejected for ${params.donorName} — ${params.amount}. Reason: ${params.reason}.`,
    subject: "Donation Receipt — Action Required",
    userHtml: `
    <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
      <div style="background:#dc2626;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#fff;margin:0;font-size:20px;">Receipt Verification Failed</h2>
      </div>
      <p style="color:#334155;">Dear <strong>${params.donorName}</strong>,</p>
      <p style="color:#334155;">We were unable to verify your donation receipt for <strong>${params.amount}</strong>.</p>
      <div style="background:#fff;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#dc2626;font-size:14px;">Reason: <strong>${params.reason}</strong></p>
      </div>
      <p style="color:#64748b;font-size:14px;">Please resubmit with a clear payment screenshot. Contact us if you need assistance.</p>
    </div>
  `,
});
