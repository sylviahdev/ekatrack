"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Capture a DOM node and emit it as a single-page A4 portrait PDF.
 * The node should be styled at exact A4 dimensions (use the .a4-sheet class).
 */
export async function exportNodeToPdf(node: HTMLElement, filename: string): Promise<void> {
  // Render at 2x for crisp text in the embedded image.
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const pageW = pdf.internal.pageSize.getWidth(); // 210
  const pageH = pdf.internal.pageSize.getHeight(); // 297
  const imgRatio = canvas.height / canvas.width;
  const imgH = pageW * imgRatio;

  if (imgH <= pageH) {
    pdf.addImage(imgData, "PNG", 0, 0, pageW, imgH);
  } else {
    // Multi-page: slice the canvas vertically
    let yMm = 0;
    let remaining = imgH;
    while (remaining > 0) {
      pdf.addImage(imgData, "PNG", 0, -yMm, pageW, imgH);
      remaining -= pageH;
      yMm += pageH;
      if (remaining > 0) pdf.addPage();
    }
  }

  pdf.save(filename);
}
