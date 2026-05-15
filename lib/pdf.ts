let pdfjs: any = null;

async function getPdfJs() {
  if (pdfjs) return pdfjs;
  if (typeof window !== 'undefined') {
    pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    return pdfjs;
  }
  return null;
}

export async function pdfToImage(file: File): Promise<{ previewUrl: string; text: string }> {
  const pdfjs = await getPdfJs();
  if (!pdfjs) throw new Error("PDF.js not available");

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  // Get text content
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  // Render first page to canvas for preview
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 }); // Reduced scale
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) throw new Error("Could not create canvas context");
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  // Set white background for JPEG
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  await (page as any).render({
    canvasContext: context,
    viewport: viewport,
  } as any).promise;
  
  // Use JPEG with 0.4 quality for significant size reduction
  const previewUrl = canvas.toDataURL('image/jpeg', 0.4);
  
  return { previewUrl, text: fullText };
}
