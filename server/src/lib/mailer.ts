import nodemailer from 'nodemailer';
import env from './env';
import logger from './logger';

/**
 * Nodemailer transporter — configured via SMTP env vars.
 * Falls back to Ethereal (fake SMTP) in development when no SMTP_HOST is set.
 */
let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  if (env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
    logger.info(`Mail transporter created (${env.SMTP_HOST}:${env.SMTP_PORT})`);
  } else {
    // Dev fallback — Ethereal fake SMTP
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    logger.info(
      `Mail transporter created (Ethereal dev mode — preview URLs in logs)`
    );
  }

  return transporter;
}

export interface LowStockItem {
  productId: string;
  name: string;
  stockQuantity: number;
  stockThreshold: number;
  price: number;
}

/**
 * Send a low-stock alert email listing all products below their threshold.
 */
export async function sendLowStockAlert(
  to: string,
  products: LowStockItem[]
): Promise<{ messageId: string; previewUrl?: string | false }> {
  const transport = await getTransporter();

  const rows = products
    .map(
      (p) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">${p.name}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;color:${p.stockQuantity === 0 ? '#dc2626' : '#d97706'};font-weight:bold">${p.stockQuantity}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${p.stockThreshold}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">$${p.price.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#d97706">⚠️ Low Stock Alert</h2>
      <p>${products.length} product${products.length !== 1 ? 's are' : ' is'} below the stock threshold and may need reordering.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#fef3c7">
            <th style="padding:8px 12px;text-align:left">Product</th>
            <th style="padding:8px 12px;text-align:center">Stock</th>
            <th style="padding:8px 12px;text-align:center">Threshold</th>
            <th style="padding:8px 12px;text-align:right">Price</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-size:12px;color:#9ca3af">This is an automated alert from jikmunn Inventory Management.</p>
    </div>
  `;

  const info = await transport.sendMail({
    from: env.SMTP_FROM ?? '"Inventory Alerts" <alerts@inventory.local>',
    to,
    subject: `🔔 Low Stock Alert — ${products.length} product${products.length !== 1 ? 's' : ''} below threshold`,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    logger.info(`📧 Email preview URL: ${previewUrl}`);
  }

  return { messageId: info.messageId, previewUrl };
}
