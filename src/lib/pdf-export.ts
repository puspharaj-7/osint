// ============================================================
// src/lib/pdf-export.ts
// Generates a structured PDF report for a given investigation
// ============================================================

import jsPDF from 'jspdf';
import type { Investigation } from './mock-data';

function riskColor(score: number): [number, number, number] {
  if (score >= 70) return [220, 38, 38];    // red
  if (score >= 40) return [234, 179, 8];    // yellow
  return [34, 197, 94];                      // green
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 5
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export function exportCaseToPDF(inv: Investigation): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ── Header bar ──────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // dark bg
  doc.rect(0, 0, pageW, 35, 'F');
  doc.setTextColor(34, 197, 94); // primary green
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('OSIRIS INTELLIGENCE PLATFORM', margin, 14);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('CLASSIFIED INVESTIGATION REPORT', margin, 21);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 27);
  doc.setTextColor(34, 197, 94);
  doc.text(`${inv.caseId}`, pageW - margin, 27, { align: 'right' });
  y = 44;

  // ── Subject header ───────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(inv.target, margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Type: ${inv.targetType}  |  Status: ${inv.status.toUpperCase()}  |  Scan: ${inv.scanStatus.toUpperCase()}`, margin, y);
  y += 4;
  doc.text(`Created: ${new Date(inv.createdAt).toLocaleString()}  |  Last updated: ${new Date(inv.updatedAt).toLocaleString()}`, margin, y);
  y += 8;

  // ── Divider ──────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── Risk metrics ─────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('RISK ASSESSMENT', margin, y);
  y += 6;

  const [rr, rg, rb] = riskColor(inv.riskScore);
  doc.setFillColor(rr, rg, rb);
  doc.roundedRect(margin, y, 55, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`${inv.riskScore}`, margin + 10, y + 11);
  doc.setFontSize(8);
  doc.text('RISK SCORE', margin + 22, y + 6);
  doc.text(inv.riskLevel.toUpperCase(), margin + 22, y + 12);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + 62, y, 55, 16, 2, 2, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.text(`${inv.identityConfidence}%`, margin + 72, y + 11);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('IDENTITY', margin + 93, y + 6);
  doc.text('CONFIDENCE', margin + 93, y + 12);

  y += 24;

  // ── Inputs ───────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('TARGET IDENTIFIERS', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  for (const input of inv.inputs) {
    doc.setTextColor(100, 116, 139);
    doc.text(`${input.type.toUpperCase()}:`, margin, y);
    doc.setTextColor(15, 23, 42);
    doc.text(input.value, margin + 22, y);
    y += 5;
  }
  y += 3;

  // ── Evidence ─────────────────────────────────────────────
  doc.line(margin, y, pageW - margin, y); y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`EVIDENCE SOURCES (${inv.evidence.length})`, margin, y);
  y += 6;

  for (const ev of inv.evidence) {
    if (y > 260) { doc.addPage(); y = margin; }
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y - 3, contentW, 18 + Math.min(ev.content.split('\n').length * 4, 28), 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(ev.title, margin + 3, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Source: ${ev.source}  |  Confidence: ${ev.confidence}%  |  ${new Date(ev.timestamp).toLocaleDateString()}`, margin + 3, y + 7);
    doc.setTextColor(51, 65, 85);
    y = addWrappedText(doc, ev.content, margin + 3, y + 12, contentW - 6, 4);
    y += 6;
  }

  if (inv.evidence.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('No evidence collected.', margin + 3, y);
    y += 8;
  }

  // ── Alerts ───────────────────────────────────────────────
  if (inv.alerts.length > 0) {
    if (y > 250) { doc.addPage(); y = margin; }
    doc.line(margin, y, pageW - margin, y); y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`ALERTS (${inv.alerts.length})`, margin, y);
    y += 6;
    for (const alert of inv.alerts) {
      if (y > 265) { doc.addPage(); y = margin; }
      const sevColor: Record<string, [number, number, number]> = {
        critical: [220, 38, 38],
        high: [234, 88, 12],
        medium: [234, 179, 8],
        low: [34, 197, 94],
      };
      const [ar, ag, ab] = sevColor[alert.severity] ?? [148, 163, 184];
      doc.setFillColor(ar, ag, ab);
      doc.rect(margin, y - 1, 3, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(alert.title, margin + 6, y + 3);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      y = addWrappedText(doc, alert.description, margin + 6, y + 7, contentW - 10, 4);
      y += 4;
    }
  }

  // ── Timeline ─────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = margin; }
  doc.line(margin, y, pageW - margin, y); y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('INVESTIGATION TIMELINE', margin, y);
  y += 6;
  for (const entry of inv.timeline) {
    if (y > 270) { doc.addPage(); y = margin; }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(new Date(entry.timestamp).toLocaleString(), margin, y);
    doc.setTextColor(15, 23, 42);
    y = addWrappedText(doc, entry.event, margin + 38, y, contentW - 40, 4);
    y += 2;
  }

  // ── Notes ────────────────────────────────────────────────
  if (inv.notes.length > 0) {
    if (y > 240) { doc.addPage(); y = margin; }
    doc.line(margin, y, pageW - margin, y); y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('INVESTIGATOR NOTES', margin, y);
    y += 6;
    for (const note of inv.notes) {
      if (y > 270) { doc.addPage(); y = margin; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      y = addWrappedText(doc, `• ${note}`, margin, y, contentW, 5);
      y += 2;
    }
  }

  // ── Footer ───────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`OSIRIS Intelligence Platform — ${inv.caseId} — CONFIDENTIAL`, margin, 292);
    doc.text(`Page ${p} of ${pageCount}`, pageW - margin, 292, { align: 'right' });
  }

  doc.save(`${inv.caseId}-report.pdf`);
}
