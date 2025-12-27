import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = 'sj240324@outlook.kr';

const rentalPeriods = [
  { value: "1night2days", label: "1박 2일 (15,000원)", price: 15000 },
  { value: "2nights3days", label: "2박 3일 (25,000원)", price: 25000 },
  { value: "3nights4days", label: "3박 4일 (35,000원)", price: 35000 },
  { value: "4nightsPlus", label: "4박 5일 이상 (5,000원/1박 추가)", price: null },
] as const;

const applicationSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  rentalPeriod: z.string().min(1),
  additionalRequests: z.string().optional(),
});

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

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parsed = applicationSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: parsed.error.issues 
      });
    }

    const application = {
      id: generateId(),
      ...parsed.data,
      email: parsed.data.email || null,
      additionalRequests: parsed.data.additionalRequests || null,
    };

    if (resend && ADMIN_EMAIL) {
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
        await resend.emails.send({
          from: 'Camping Heater <onboarding@resend.dev>',
          to: [ADMIN_EMAIL],
          subject: `[캠핑난로] 새로운 대여 신청 - ${application.name}님`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }

    return res.status(201).json(application);
  } catch (error) {
    console.error('Error creating rental application:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
