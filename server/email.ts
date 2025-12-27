import { Resend } from 'resend';
import type { RentalApplication } from '@shared/schema';
import { rentalPeriods } from '@shared/schema';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const ADMIN_EMAIL = 'sj240324@outlook.kr';

function getRentalPeriodLabel(value: string): string {
  const period = rentalPeriods.find(p => p.value === value);
  return period ? period.label : value;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function sendApplicationNotification(application: RentalApplication): Promise<boolean> {
  if (!resend || !ADMIN_EMAIL) {
    console.log('Email notification skipped: RESEND_API_KEY or ADMIN_EMAIL not configured');
    return false;
  }

  const emailHtml = `
    <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #654E32; border-bottom: 2px solid #654E32; padding-bottom: 10px;">
        새로운 캠핑난로 대여 신청
      </h1>
      
      <div style="background-color: #F9F8F4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">신청자 정보</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 120px;">이름</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${application.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">연락처</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${application.phone}</td>
          </tr>
          ${application.email ? `
          <tr>
            <td style="padding: 8px 0; color: #666;">이메일</td>
            <td style="padding: 8px 0; color: #333;">${application.email}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <div style="background-color: #FFF; border: 1px solid #E5E5E5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">대여 정보</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 120px;">대여 시작일</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${formatDate(application.startDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">반납 예정일</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${formatDate(application.endDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">대여 기간</td>
            <td style="padding: 8px 0; color: #654E32; font-weight: bold;">${getRentalPeriodLabel(application.rentalPeriod)}</td>
          </tr>
        </table>
      </div>

      ${application.additionalRequests ? `
      <div style="background-color: #FFF; border: 1px solid #E5E5E5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">추가 요청사항</h2>
        <p style="color: #333; white-space: pre-wrap;">${application.additionalRequests}</p>
      </div>
      ` : ''}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E5E5; color: #888; font-size: 12px;">
        <p>이 이메일은 캠핑난로 대여 서비스에서 자동으로 발송되었습니다.</p>
        <p>신청 ID: ${application.id}</p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Camping Heater <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: `[캠핑난로] 새로운 대여 신청 - ${application.name}님`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return false;
    }

    console.log('Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
