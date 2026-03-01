import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getResendClient } from '@/lib/email/resend';
import { getAuthSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { handoffId, recipients } = body;

    if (!handoffId || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'handoffId and recipients array are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch handoff
    const { data: handoff, error: handoffError } = await supabase
      .from('handoffs')
      .select('*, clients(company_name)')
      .eq('id', handoffId)
      .single();

    if (handoffError || !handoff) {
      return NextResponse.json(
        { error: 'Handoff not found' },
        { status: 404 }
      );
    }

    const resend = getResendClient();
    const companyName = (handoff as any).clients?.company_name || 'Client';

    // Send email
    const { error: sendError } = await resend.emails.send({
      from: 'systm.re <noreply@systm.re>',
      to: recipients,
      subject: `Handoff - ${companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a2e;">Handoff - ${companyName}</h1>
          <p>Veuillez trouver ci-joint le document de handoff pour ${companyName}.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
            ${handoff.markdown_content}
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Envoyé depuis la plateforme systm.re
          </p>
        </div>
      `,
    });

    if (sendError) {
      console.error('Resend error:', sendError);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Update handoff status
    await supabase
      .from('handoffs')
      .update({
        status: 'sent',
        sent_to: recipients,
        sent_at: new Date().toISOString(),
      })
      .eq('id', handoffId);

    // Update client status
    await supabase
      .from('clients')
      .update({ status: 'handoff_sent' })
      .eq('id', handoff.client_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send handoff email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
