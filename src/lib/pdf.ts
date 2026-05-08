"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Capture a DOM node and emit it as an A4 portrait PDF.
 * The node should be styled at exact A4 dimensions (use the .a4-sheet class).
 */
export async function exportNodeToPdf(
  node: HTMLElement,
  filename: string
): Promise<void> {
  // Webfonts (Inter, Playfair Display) load asynchronously via next/font;
  // wait for them so html2canvas captures the rendered glyphs, not fallbacks.
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }

  const canvas = await html2canvas(node, {
    scale: 3,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    imageTimeout: 0,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const pageW = pdf.internal.pageSize.getWidth(); // 210
  const pageH = pdf.internal.pageSize.getHeight(); // 297
  const imgRatio = canvas.height / canvas.width;
  const imgH = pageW * imgRatio;
  const totalPages = Math.max(1, Math.ceil(imgH / pageH));

  const drawPageNumber = (current: number) => {
    if (totalPages <= 1) return;
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`${current} / ${totalPages}`, pageW - 10, pageH - 6, {
      align: "right",
    });
  };

  if (totalPages === 1) {
    pdf.addImage(imgData, "PNG", 0, 0, pageW, imgH);
  } else {
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, -i * pageH, pageW, imgH);
      drawPageNumber(i + 1);
    }
  }

  pdf.save(filename);
}
