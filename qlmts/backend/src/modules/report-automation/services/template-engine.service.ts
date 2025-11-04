import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { format, parseISO } from 'date-fns';

@Injectable()
export class TemplateEngineService {
  private readonly logger = new Logger(TemplateEngineService.name);
  private handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerHelpers();
    this.registerPartials();
  }

  async render(template: any, data: any): Promise<string> {
    try {
      // Compile header, body, and footer templates
      const headerTemplate = this.handlebars.compile(template.headerTemplate);
      const bodyTemplate = this.handlebars.compile(template.bodyTemplate);
      const footerTemplate = this.handlebars.compile(template.footerTemplate);

      // Process data with table configurations
      const processedData = this.processDataWithTableConfig(data, template.tableConfig);

      // Render each section
      const header = headerTemplate(processedData);
      const body = bodyTemplate(processedData);
      const footer = footerTemplate(processedData);

      // Combine sections with page configuration
      const fullContent = this.combineContent(header, body, footer, template.pageConfig);

      return fullContent;
    } catch (error) {
      this.logger.error(`Template rendering failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private registerHelpers() {
    // Date formatting helper
    this.handlebars.registerHelper('formatDate', (date, formatStr) => {
      if (!date) return '';
      try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatStr || 'dd/MM/yyyy');
      } catch {
        return date;
      }
    });

    // Number formatting helper
    this.handlebars.registerHelper('formatNumber', (value, precision) => {
      if (value === null || value === undefined) return '-';
      return Number(value).toFixed(precision || 2);
    });

    // Conditional helper for verdict styling
    this.handlebars.registerHelper('verdictClass', (verdict) => {
      switch (verdict) {
        case 'PASS':
          return 'verdict-pass';
        case 'FAIL':
          return 'verdict-fail';
        case 'PASS_WITH_DEVIATION':
          return 'verdict-deviation';
        default:
          return '';
      }
    });

    // Table generation helper
    this.handlebars.registerHelper('table', (context, options) => {
      if (!context || !Array.isArray(context)) return '';

      let html = '<table class="data-table">';
      
      // Generate header
      if (context.length > 0) {
        html += '<thead><tr>';
        const headers = options.hash.headers || Object.keys(context[0]);
        headers.forEach(header => {
          html += `<th>${this.formatHeader(header)}</th>`;
        });
        html += '</tr></thead>';
      }

      // Generate body
      html += '<tbody>';
      context.forEach(row => {
        html += '<tr>';
        const headers = options.hash.headers || Object.keys(row);
        headers.forEach(header => {
          const value = row[header];
          const formatted = this.formatCellValue(value, header);
          const cssClass = this.getCellClass(value, header);
          html += `<td class="${cssClass}">${formatted}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table>';

      return new this.handlebars.SafeString(html);
    });

    // QR Code helper
    this.handlebars.registerHelper('qrCode', (data) => {
      if (!data) return '';
      return new this.handlebars.SafeString(
        `<div class="qr-code"><img src="data:image/png;base64,${data}" alt="QR Code" /></div>`
      );
    });

    // Signature block helper
    this.handlebars.registerHelper('signatureBlock', (signatures) => {
      if (!signatures || !Array.isArray(signatures)) return '';

      let html = '<div class="signature-section">';
      signatures.forEach(sig => {
        html += `
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">${sig.name}</div>
            <div class="signature-role">${sig.role}</div>
            <div class="signature-date">${this.formatDate(sig.timestamp)}</div>
          </div>
        `;
      });
      html += '</div>';

      return new this.handlebars.SafeString(html);
    });

    // Page numbering helper
    this.handlebars.registerHelper('pageNumbers', () => {
      return new this.handlebars.SafeString(
        '<div class="page-numbers">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
      );
    });

    // Conditional content based on customer requirements
    this.handlebars.registerHelper('ifCustomer', (customerCode, options) => {
      if (options.data.root.customer && options.data.root.customer.code === customerCode) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Unit conversion helper
    this.handlebars.registerHelper('convertUnit', (value, fromUnit, toUnit) => {
      // Implement unit conversion logic
      return this.convertUnits(value, fromUnit, toUnit);
    });

    // Specification range helper
    this.handlebars.registerHelper('specRange', (min, max, unit) => {
      if (min !== null && max !== null) {
        return `${min} - ${max} ${unit}`;
      } else if (min !== null) {
        return `Min: ${min} ${unit}`;
      } else if (max !== null) {
        return `Max: ${max} ${unit}`;
      }
      return '-';
    });
  }

  private registerPartials() {
    // Register common partials
    this.handlebars.registerPartial('header', `
      <div class="report-header">
        {{#if customer.logo}}
          <img src="{{customer.logo}}" alt="{{customer.name}}" class="customer-logo" />
        {{/if}}
        <div class="header-info">
          <h1>{{reportTitle}}</h1>
          <div class="report-number">Report No: {{report_no}}</div>
          <div class="report-date">Date: {{formatDate report_date "dd MMM yyyy"}}</div>
          {{#if version}}
            <div class="report-version">Version: {{version}}</div>
          {{/if}}
        </div>
      </div>
    `);

    this.handlebars.registerPartial('customerInfo', `
      <div class="customer-section">
        <h2>Customer Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Customer:</label>
            <span>{{customer.name}}</span>
          </div>
          <div class="info-item">
            <label>Code:</label>
            <span>{{customer.code}}</span>
          </div>
          {{#if customer.address}}
            <div class="info-item full-width">
              <label>Address:</label>
              <span>{{customer.address}}</span>
            </div>
          {{/if}}
        </div>
      </div>
    `);

    this.handlebars.registerPartial('traceabilityInfo', `
      <div class="traceability-section">
        <h2>Material Traceability</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Heat No:</label>
            <span>{{trace.heat_no}}</span>
          </div>
          {{#if trace.batch_no}}
            <div class="info-item">
              <label>Batch No:</label>
              <span>{{trace.batch_no}}</span>
            </div>
          {{/if}}
          <div class="info-item">
            <label>Supplier:</label>
            <span>{{trace.supplier}}</span>
          </div>
          {{#if trace.mtc_no}}
            <div class="info-item">
              <label>MTC No:</label>
              <span>{{trace.mtc_no}}</span>
            </div>
          {{/if}}
        </div>
      </div>
    `);

    this.handlebars.registerPartial('chemistryTable', `
      {{#if chemistry}}
        <div class="test-section">
          <h2>Chemical Composition</h2>
          {{table chemistry headers="element,min,max,result,verdict"}}
        </div>
      {{/if}}
    `);

    this.handlebars.registerPartial('mechanicalTable', `
      {{#if mechanical}}
        <div class="test-section">
          <h2>Mechanical Properties</h2>
          <table class="data-table">
            <tr>
              <th>Property</th>
              <th>Unit</th>
              <th>Specification</th>
              <th>Result</th>
              <th>Verdict</th>
            </tr>
            {{#if mechanical.UTS_MPa}}
              <tr>
                <td>Ultimate Tensile Strength</td>
                <td>MPa</td>
                <td>{{mechanical.spec}}</td>
                <td>{{formatNumber mechanical.UTS_MPa 0}}</td>
                <td class="{{verdictClass mechanical.verdict}}">{{mechanical.verdict}}</td>
              </tr>
            {{/if}}
            {{#if mechanical.YS_MPa}}
              <tr>
                <td>Yield Strength</td>
                <td>MPa</td>
                <td>{{mechanical.spec}}</td>
                <td>{{formatNumber mechanical.YS_MPa 0}}</td>
                <td class="{{verdictClass mechanical.verdict}}">{{mechanical.verdict}}</td>
              </tr>
            {{/if}}
            {{#if mechanical.El_pct}}
              <tr>
                <td>Elongation</td>
                <td>%</td>
                <td>{{mechanical.spec}}</td>
                <td>{{formatNumber mechanical.El_pct 1}}</td>
                <td class="{{verdictClass mechanical.verdict}}">{{mechanical.verdict}}</td>
              </tr>
            {{/if}}
          </table>
        </div>
      {{/if}}
    `);

    this.handlebars.registerPartial('footer', `
      <div class="report-footer">
        <div class="footer-content">
          {{#if signatures}}
            {{signatureBlock signatures}}
          {{/if}}
          
          <div class="verification-section">
            {{#if qr_code}}
              {{qrCode qr_code}}
            {{/if}}
            {{#if checksum}}
              <div class="checksum">
                <small>Document Checksum: {{checksum}}</small>
              </div>
            {{/if}}
            {{#if qr_url}}
              <div class="verify-url">
                <small>Verify at: {{qr_url}}</small>
              </div>
            {{/if}}
          </div>
          
          <div class="page-info">
            {{pageNumbers}}
          </div>
        </div>
      </div>
    `);
  }

  private processDataWithTableConfig(data: any, tableConfig: any): any {
    if (!tableConfig) return data;

    const processed = { ...data };

    // Apply table configuration rules
    if (tableConfig.chemistry) {
      processed.chemistry = this.processChemistryTable(data.chemistry, tableConfig.chemistry);
    }

    if (tableConfig.mechanical) {
      processed.mechanical = this.processMechanicalTable(data.mechanical, tableConfig.mechanical);
    }

    // Apply customer-specific field ordering
    if (tableConfig.fieldOrder) {
      processed.orderedFields = this.orderFields(data, tableConfig.fieldOrder);
    }

    return processed;
  }

  private processChemistryTable(chemistry: any[], config: any): any[] {
    if (!chemistry || !Array.isArray(chemistry)) return [];

    let processed = [...chemistry];

    // Apply element ordering
    if (config.elementOrder) {
      processed = processed.sort((a, b) => {
        const aIndex = config.elementOrder.indexOf(a.element);
        const bIndex = config.elementOrder.indexOf(b.element);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    // Show zero values for specified elements
    if (config.showZeroElements) {
      config.showZeroElements.forEach(element => {
        if (!processed.find(e => e.element === element)) {
          processed.push({
            element,
            min: null,
            max: null,
            result: 0,
            verdict: 'PASS',
          });
        }
      });
    }

    return processed;
  }

  private processMechanicalTable(mechanical: any, config: any): any {
    if (!mechanical) return null;

    const processed = { ...mechanical };

    // Apply unit conversion if needed
    if (config.units) {
      if (config.units.strength === 'ksi' && processed.UTS_MPa) {
        processed.UTS_ksi = this.convertUnits(processed.UTS_MPa, 'MPa', 'ksi');
        processed.YS_ksi = this.convertUnits(processed.YS_MPa, 'MPa', 'ksi');
      }
    }

    return processed;
  }

  private orderFields(data: any, fieldOrder: string[]): any[] {
    const ordered = [];
    fieldOrder.forEach(field => {
      if (data[field] !== undefined) {
        ordered.push({ key: field, value: data[field] });
      }
    });
    return ordered;
  }

  private combineContent(header: string, body: string, footer: string, pageConfig: any): string {
    const config = pageConfig || {};
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            ${this.getDefaultStyles(config)}
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header-wrapper">${header}</div>
            <div class="body-wrapper">${body}</div>
            <div class="footer-wrapper">${footer}</div>
          </div>
        </body>
      </html>
    `;
  }

  private getDefaultStyles(config: any): string {
    return `
      @page {
        size: ${config.size || 'A4'} ${config.orientation || 'portrait'};
        margin: ${config.margins || '20mm'};
      }
      
      body {
        font-family: ${config.fontFamily || 'Arial, sans-serif'};
        font-size: ${config.fontSize || '11pt'};
        line-height: 1.5;
        color: #333;
      }
      
      .page {
        width: 100%;
        position: relative;
      }
      
      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #1e40af;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      
      .customer-logo {
        max-height: 60px;
        max-width: 200px;
      }
      
      h1 {
        color: #1e40af;
        font-size: 18pt;
        margin: 0;
      }
      
      h2 {
        color: #1e40af;
        font-size: 14pt;
        margin-top: 20px;
        margin-bottom: 10px;
        border-bottom: 1px solid #cbd5e1;
        padding-bottom: 5px;
      }
      
      .data-table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
      }
      
      .data-table th {
        background-color: #f1f5f9;
        color: #1e40af;
        font-weight: bold;
        padding: 8px;
        border: 1px solid #cbd5e1;
        text-align: left;
      }
      
      .data-table td {
        padding: 6px 8px;
        border: 1px solid #cbd5e1;
      }
      
      .verdict-pass {
        color: #16a34a;
        font-weight: bold;
      }
      
      .verdict-fail {
        color: #dc2626;
        font-weight: bold;
      }
      
      .verdict-deviation {
        color: #f59e0b;
        font-weight: bold;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin: 10px 0;
      }
      
      .info-item {
        display: flex;
        gap: 10px;
      }
      
      .info-item label {
        font-weight: bold;
        min-width: 100px;
      }
      
      .info-item.full-width {
        grid-column: span 2;
      }
      
      .signature-section {
        display: flex;
        justify-content: space-around;
        margin-top: 40px;
      }
      
      .signature-block {
        text-align: center;
        min-width: 150px;
      }
      
      .signature-line {
        border-bottom: 1px solid #333;
        width: 150px;
        margin: 0 auto 5px;
        height: 40px;
      }
      
      .signature-name {
        font-weight: bold;
      }
      
      .signature-role {
        font-size: 9pt;
        color: #666;
      }
      
      .signature-date {
        font-size: 9pt;
        color: #666;
      }
      
      .qr-code {
        text-align: center;
        margin: 20px 0;
      }
      
      .qr-code img {
        width: 100px;
        height: 100px;
      }
      
      .verification-section {
        text-align: center;
        margin-top: 20px;
        padding-top: 10px;
        border-top: 1px solid #cbd5e1;
      }
      
      .checksum, .verify-url {
        font-size: 8pt;
        color: #666;
        margin: 5px 0;
      }
      
      .page-numbers {
        text-align: right;
        font-size: 9pt;
        color: #666;
        margin-top: 10px;
      }
      
      @media print {
        .page {
          page-break-after: always;
        }
        
        .header-wrapper {
          position: fixed;
          top: 0;
          width: 100%;
        }
        
        .footer-wrapper {
          position: fixed;
          bottom: 0;
          width: 100%;
        }
        
        .body-wrapper {
          margin-top: 120px;
          margin-bottom: 100px;
        }
      }
    `;
  }

  private formatHeader(header: string): string {
    // Convert snake_case or camelCase to Title Case
    return header
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private formatCellValue(value: any, header: string): string {
    if (value === null || value === undefined) return '-';
    
    // Format based on header type
    if (header.includes('date') || header.includes('Date')) {
      return this.formatDate(value);
    }
    
    if (typeof value === 'number') {
      // Determine precision based on header
      let precision = 2;
      if (header.includes('count') || header.includes('quantity')) {
        precision = 0;
      } else if (header.includes('percent') || header.includes('%')) {
        precision = 1;
      }
      return value.toFixed(precision);
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return String(value);
  }

  private getCellClass(value: any, header: string): string {
    if (header.toLowerCase() === 'verdict' || header.toLowerCase() === 'status') {
      switch (value) {
        case 'PASS':
          return 'verdict-pass';
        case 'FAIL':
          return 'verdict-fail';
        case 'PASS_WITH_DEVIATION':
          return 'verdict-deviation';
        default:
          return '';
      }
    }
    return '';
  }

  private formatDate(date: any): string {
    if (!date) return '-';
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, 'dd/MM/yyyy');
    } catch {
      return String(date);
    }
  }

  private convertUnits(value: number, fromUnit: string, toUnit: string): number {
    // Unit conversion implementation
    const conversions = {
      'MPa_to_ksi': 0.145038,
      'ksi_to_MPa': 6.89476,
      'mm_to_inch': 0.0393701,
      'inch_to_mm': 25.4,
      'kg_to_lb': 2.20462,
      'lb_to_kg': 0.453592,
    };

    const key = `${fromUnit}_to_${toUnit}`;
    if (conversions[key]) {
      return value * conversions[key];
    }

    return value; // Return original if conversion not found
  }
}