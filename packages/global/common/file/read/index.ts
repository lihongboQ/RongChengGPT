/* read file to txt */
import * as pdfjsLib from 'pdfjs-dist';

export const readPdfFile = async ({ pdf }: { pdf: string | URL | ArrayBuffer }) => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.js';

  type TokenType = {
    str: string;
    dir: string;
    width: number;
    height: number;
    transform: number[];
    fontName: string;
    hasEOL: boolean;
  };

  const readPDFPage = async (doc: any, pageNo: number) => {
    const page = await doc.getPage(pageNo);
    const tokenizedText = await page.getTextContent();

    const viewport = page.getViewport({ scale: 1 });
    const pageHeight = viewport.height;
    const headerThreshold = pageHeight * 0.07; // 假设页头在页面顶部5%的区域内
    const footerThreshold = pageHeight * 0.93; // 假设页脚在页面底部5%的区域内

    const pageTexts: TokenType[] = tokenizedText.items.filter((token: TokenType) => {
      return (
        !token.transform ||
        (token.transform[5] > headerThreshold && token.transform[5] < footerThreshold)
      );
    });

    // concat empty string 'hasEOL'
    for (let i = 0; i < pageTexts.length; i++) {
      const item = pageTexts[i];
      if (item.str === '' && pageTexts[i - 1]) {
        pageTexts[i - 1].hasEOL = item.hasEOL;
        pageTexts.splice(i, 1);
        i--;
      }
    }

    page.cleanup();

    return pageTexts
      .map((token) => {
        const paragraphEnd = token.hasEOL && /([。？！.?!\n\r]|(\r\n))$/.test(token.str);

        return paragraphEnd ? `${token.str}\n` : token.str;
      })
      .join('');
  };

  const doc = await pdfjsLib.getDocument(pdf).promise;
  const pageTextPromises = [];
  for (let pageNo = 1; pageNo <= doc.numPages; pageNo++) {
    pageTextPromises.push(readPDFPage(doc, pageNo));
  }
  const pageTexts = await Promise.all(pageTextPromises);

  return pageTexts.join('');
};
