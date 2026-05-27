type ExportOptions = {
  filename: string;
  element: HTMLElement;
};

const ensureElement = (element: HTMLElement | null): HTMLElement => {
  if (!element) {
    throw new Error("Resume preview is not ready yet.");
  }
  return element;
};

export const exportResumeToPdf = async (options: ExportOptions) => {
  const element = ensureElement(options.element);
  const { toPng } = await import("html-to-image");
  const { jsPDF } = await import("jspdf");
  const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2 });
  const rect = element.getBoundingClientRect();
  const width = Math.max(1, Math.ceil(rect.width));
  const height = Math.max(1, Math.ceil(rect.height));

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [width, height],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
  pdf.save(options.filename);
};

export const exportResumeToPng = async (options: ExportOptions) => {
  const element = ensureElement(options.element);
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2 });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = options.filename;
  link.click();
};