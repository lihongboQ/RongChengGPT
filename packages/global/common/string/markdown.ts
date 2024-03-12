import { simpleText } from './tools';

/* Delete redundant text in markdown */
export const simpleMarkdownText = (rawText: string) => {
  rawText = simpleText(rawText);

  // Remove a line feed from a hyperlink or picture
  rawText = rawText.replace(/\[([^\]]+)\]\((.+?)\)/g, (match, linkText, url) => {
    const cleanedLinkText = linkText.replace(/\n/g, ' ').trim();

    if (!url) {
      return '';
    }

    return `[${cleanedLinkText}](${url})`;
  });

  // replace special \.* ……
  const reg1 = /\\([-.!`_(){}\[\]])/g;
  if (reg1.test(rawText)) {
    rawText = rawText.replace(/\\([`!*()+-_\[\]{}\\.])/g, '$1');
  }

  // replace \\n
  rawText = rawText.replace(/\\\\n/g, '\\n');

  // Remove headings and code blocks front spaces
  ['####', '###', '##', '#', '```', '~~~'].forEach((item, i) => {
    const reg = new RegExp(`\\n\\s*${item}`, 'g');
    if (reg.test(rawText)) {
      rawText = rawText.replace(new RegExp(`(\\n)( *)(${item})`, 'g'), '$1$3');
    }
  });

  return rawText.trim();
};

/**
 * format markdown
 * 1. upload base64
 * 2. replace \
 */
export const uploadMarkdownBase64 = async ({
  rawText,
  uploadImgController
}: {
  rawText: string;
  uploadImgController: (base64: string) => Promise<string>;
}) => {
  // match base64, upload and replace it
  const base64Regex = /data:image\/.*;base64,([^\)]+)/g;
  const base64Arr = rawText.match(base64Regex) || [];
  // upload base64 and replace it
  await Promise.all(
    base64Arr.map(async (base64Img) => {
      try {
        const str = await uploadImgController(base64Img);

        rawText = rawText.replace(base64Img, str);
      } catch (error) {
        rawText = rawText.replace(base64Img, '');
        rawText = rawText.replace(/!\[.*\]\(\)/g, '');
      }
    })
  );

  // Remove white space on both sides of the picture
  const trimReg = /(!\[.*\]\(.*\))\s*/g;
  if (trimReg.test(rawText)) {
    rawText = rawText.replace(trimReg, '$1');
  }

  return simpleMarkdownText(rawText);
};
