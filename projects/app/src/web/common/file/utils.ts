import mammoth from 'mammoth';
import Papa from 'papaparse';
import { compressBase64ImgAndUpload } from './controller';
import { simpleMarkdownText } from '@fastgpt/global/common/string/markdown';
import { htmlStr2Md } from '@fastgpt/web/common/string/markdown';
import { readPdfFile } from '@fastgpt/global/common/file/read/index';
import { readFileRawText } from '@fastgpt/web/common/file/read';

/**
 * read pdf to raw text
 */
export const readPdfContent = (file: File) =>
  new Promise<string>((resolve, reject) => {
    try {
      let reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (event) => {
        if (!event?.target?.result) return reject('解析 PDF 失败');
        try {
          const content = await readPdfFile({ pdf: event.target.result });

          resolve(content);
        } catch (err) {
          console.log(err, 'pdf load error');
          reject('解析 PDF 失败');
        }
      };
      reader.onerror = (err) => {
        console.log(err, 'pdf load error');
        reject('解析 PDF 失败');
      };
    } catch (error) {
      reject('浏览器不支持文件内容读取');
    }
  });

/**
 * read docx to markdown
 */
export const readDocContent = (file: File, metadata: Record<string, any>) =>
  new Promise<string>((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async ({ target }) => {
        if (!target?.result) return reject('读取 doc 文件失败');
        try {
          const buffer = target.result as ArrayBuffer;
          const { value: html } = await mammoth.convertToHtml({
            arrayBuffer: buffer
          });
          const md = htmlStr2Md(html);

          const rawText = await uploadMarkdownBase64(md, metadata);

          resolve(rawText);
        } catch (error) {
          window.umami?.track('wordReadError', {
            err: error?.toString()
          });
          console.log('error doc read:', error);

          reject('读取 doc 文件失败, 请转换成 PDF');
        }
      };
      reader.onerror = (err) => {
        window.umami?.track('wordReadError', {
          err: err?.toString()
        });
        console.log('error doc read:', err);

        reject('读取 doc 文件失败');
      };
    } catch (error) {
      reject('浏览器不支持文件内容读取');
    }
  });

/**
 * read csv to json
 * @response {
 *  header: string[],
 *  data: string[][]
 * }
 */
export const readCsvContent = async (file: File) => {
  try {
    const textArr = await readFileRawText(file);
    const csvArr = Papa.parse(textArr).data as string[][];
    if (csvArr.length === 0) {
      throw new Error('csv 解析失败');
    }
    return {
      header: csvArr.shift() as string[],
      data: csvArr.map((item) => item)
    };
  } catch (error) {
    return Promise.reject('解析 csv 文件失败');
  }
};

/**
 * format markdown
 * 1. upload base64
 * 2. replace \
 */
export const uploadMarkdownBase64 = async (rawText: string = '', metadata: Record<string, any>) => {
  // match base64, upload and replace it
  const base64Regex = /data:image\/.*;base64,([^\)]+)/g;
  const base64Arr = rawText.match(base64Regex) || [];
  // upload base64 and replace it
  await Promise.all(
    base64Arr.map(async (base64Img) => {
      try {
        const str = await compressBase64ImgAndUpload({
          base64Img,
          maxW: 4329,
          maxH: 4329,
          maxSize: 1024 * 1024 * 5,
          metadata
        });

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

/**
 * file download by text
 */
export const fileDownload = ({
  text,
  type,
  filename
}: {
  text: string;
  type: string;
  filename: string;
}) => {
  // 导出为文件
  const blob = new Blob([`\uFEFF${text}`], { type: `${type};charset=utf-8;` });

  // 创建下载链接
  const downloadLink = document.createElement('a');
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.download = filename;

  // 添加链接到页面并触发下载
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body?.removeChild(downloadLink);
};

export const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
