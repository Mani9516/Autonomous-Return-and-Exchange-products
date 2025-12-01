import { Order, User } from '../types';

export const generateInvoice = (order: Order, user: User) => {
    const total = order.items.reduce((sum, item) => sum + item.price, 0);
    const invoiceHtml = `
    <html>
    <head>
        <title>Invoice #${order.orderId}</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .meta { text-align: right; }
            .bill-to { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; background: #f9fafb; border-bottom: 1px solid #eee; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .total { text-align: right; font-size: 20px; font-weight: bold; }
            .footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">AutoReturn AI</div>
            <div class="meta">
                <p>Invoice #: ${order.orderId}</p>
                <p>Date: ${order.date}</p>
            </div>
        </div>
        <div class="bill-to">
            <strong>Bill To:</strong><br>
            ${user.name}<br>
            ${user.email}
        </div>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                <tr>
                    <td>${item.name} <br><span style="font-size:12px;color:#666">${item.id}</span></td>
                    <td>1</td>
                    <td>$${item.price.toFixed(2)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="total">Total: $${total.toFixed(2)}</div>
        <div class="footer">
            Thank you for your business. This is an electronically generated invoice.
        </div>
    </body>
    </html>
    `;
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.orderId}.html`;
    a.click();
    URL.revokeObjectURL(url);
};