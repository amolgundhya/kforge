import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  async generate(htmlContent: string, mergeData: any): Promise<Buffer> {
    let browser;
    
    try {
      // Launch Puppeteer browser
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();

      // Set content with proper encoding
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: false,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm',
        },
      });

      // Apply watermark if this is a reissue
      if (mergeData.version && mergeData.version !== '1.0') {
        return await this.addWatermark(pdfBuffer, `REVISED v${mergeData.version}`);
      }

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`PDF generation failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private async addWatermark(pdfBuffer: Buffer, watermarkText: string): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Add watermark to each page
      pages.forEach(page => {
        const { width, height } = page.getSize();
        
        // Draw diagonal watermark
        page.drawText(watermarkText, {
          x: width / 2 - 100,
          y: height / 2,
          size: 50,
          font,
          color: rgb(0.8, 0.8, 0.8),
          opacity: 0.3,
          rotate: { angle: -45 },
        });
      });

      const watermarkedPdf = await pdfDoc.save();
      return Buffer.from(watermarkedPdf);
    } catch (error) {
      this.logger.error(`Watermark application failed: ${error.message}`, error.stack);
      return pdfBuffer; // Return original if watermarking fails
    }
  }

  async generateBulkPdf(reports: Array<{ html: string; data: any }>): Promise<Buffer> {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const mergedPdf = await PDFDocument.create();

      for (const report of reports) {
        const page = await browser.newPage();
        await page.setContent(report.html, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
        });

        const pdf = await PDFDocument.load(pdfBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));

        await page.close();
      }

      const mergedPdfBytes = await mergedPdf.save();
      return Buffer.from(mergedPdfBytes);
    } catch (error) {
      this.logger.error(`Bulk PDF generation failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}