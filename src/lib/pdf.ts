import jsPDF from "jspdf";
import { Invoice, UserProfile } from "@/types";

export async function generateInvoicePDF(
  invoice: Invoice,
  profile: UserProfile | null
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Use built-in Helvetica (Japanese characters will be rendered as-is)
  // For production, load Noto Sans JP font
  doc.setFont("Helvetica");

  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Title
  doc.setFontSize(24);
  doc.text("INVOICE", margin, y);
  doc.setFontSize(10);
  doc.text(invoice.invoiceNumber, pageWidth - margin, y, { align: "right" });
  y += 15;

  // Dates
  doc.setFontSize(9);
  doc.text(`Issue Date: ${invoice.issueDate}`, margin, y);
  doc.text(`Due Date: ${invoice.dueDate}`, margin, y + 5);
  y += 15;

  // Separator
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // From (business info)
  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
  doc.text("From:", margin, y);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  if (profile) {
    const fromLines = [
      profile.businessName || profile.displayName || "",
      profile.address || "",
      profile.phone || "",
      profile.email || "",
      profile.invoiceNumber ? `Registration: ${profile.invoiceNumber}` : "",
    ].filter(Boolean);
    fromLines.forEach((line, i) => {
      doc.text(line, margin, y + 5 + i * 5);
    });
  }

  // To (client info)
  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
  doc.text("To:", pageWidth / 2, y);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.text(invoice.clientName, pageWidth / 2, y + 5);
  y += 35;

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setFontSize(9);
  doc.setFont("Helvetica", "bold");
  doc.text("Description", margin + 2, y + 5.5);
  doc.text("Qty", margin + 100, y + 5.5, { align: "right" });
  doc.text("Unit Price", margin + 130, y + 5.5, { align: "right" });
  doc.text("Amount", margin + contentWidth - 2, y + 5.5, { align: "right" });
  y += 10;

  // Table rows
  doc.setFont("Helvetica", "normal");
  invoice.items.forEach((item) => {
    doc.text(item.description, margin + 2, y + 4);
    doc.text(String(item.quantity), margin + 100, y + 4, { align: "right" });
    doc.text(`¥${item.unitPrice.toLocaleString()}`, margin + 130, y + 4, {
      align: "right",
    });
    doc.text(`¥${item.amount.toLocaleString()}`, margin + contentWidth - 2, y + 4, {
      align: "right",
    });
    doc.setDrawColor(230);
    doc.line(margin, y + 7, pageWidth - margin, y + 7);
    y += 8;
  });

  y += 5;

  // Totals
  const totalsX = margin + contentWidth - 60;
  doc.setFontSize(9);
  doc.text("Subtotal:", totalsX, y);
  doc.text(`¥${invoice.subtotal.toLocaleString()}`, margin + contentWidth - 2, y, {
    align: "right",
  });
  y += 6;

  doc.text(`Tax (${invoice.taxRate}%):`, totalsX, y);
  doc.text(`¥${invoice.taxAmount.toLocaleString()}`, margin + contentWidth - 2, y, {
    align: "right",
  });
  y += 6;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total:", totalsX, y);
  doc.text(`¥${invoice.total.toLocaleString()}`, margin + contentWidth - 2, y, {
    align: "right",
  });
  y += 15;

  // Bank info
  if (profile?.bankInfo) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Bank Transfer Details:", margin, y);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    const bankLines = profile.bankInfo.split("\n");
    bankLines.forEach((line, i) => {
      doc.text(line, margin, y + 6 + i * 5);
    });
    y += 6 + bankLines.length * 5 + 5;
  }

  // Notes
  if (invoice.notes) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Notes:", margin, y);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text(invoice.notes, margin, y + 6);
  }

  doc.save(`${invoice.invoiceNumber}.pdf`);
}
