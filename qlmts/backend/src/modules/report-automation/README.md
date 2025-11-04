# Report Automation Module

## Overview

Comprehensive report generation system for forging/manufacturing quality control with support for COA, MTC, Heat Treatment reports, and more.

## Features Implemented

### 1. **Report Types**
- **COA (Certificate of Analysis)**: Chemistry + mechanical + NDT for shipment lots
- **MTC (Mill Test Certificate)**: Maps mill MTC to internal results
- **HT Report**: Hardness & microstructure after heat treatment
- **Dispatch Report**: Customer-facing COA with PO/drawing details
- **PPAP/ISIR**: Production part approval bundles
- **Charpy**: Sub-zero impact test addendum
- **UT Map**: Ultrasonic testing coverage maps

### 2. **Template Engine**
- Handlebars-based template system with merge fields
- Customer-specific templates with branding
- Dynamic table generation with configurable field ordering
- Multi-language support
- Unit conversion helpers

### 3. **Generation Workflow**
- Auto-trigger on QC approval → Released state
- Manual generation with template selection
- Bulk generation for multiple lots (zip output)
- Reissue with versioning and watermarks

### 4. **Output Formats**
- **PDF**: Primary format with Puppeteer rendering
- **Word/DOCX**: Editable documents
- **Excel/XLSX**: Tabular data export

### 5. **Security & Compliance**
- SHA-256 checksums for integrity
- QR codes for verification
- PKI-based e-signatures (X.509)
- Immutable storage (WORM bucket simulation)
- Complete audit trail

### 6. **Report Numbering**
- Format: `PLANT-YEAR-SEQUENCE` (e.g., PUNE-25-000457)
- Optional customer code suffix
- Auto-incrementing sequences per plant/year

### 7. **Distribution**
- Email with attachments
- SAP integration (document URLs)
- Webhook notifications
- Customer portal access
- Barcode/QR linking

## API Endpoints

### Report Generation
```bash
POST /api/reports/automation/generate
{
  "reportType": "COA",
  "format": "PDF",
  "customerId": "cust-123",
  "sampleId": "sample-456",
  "autoRelease": false
}
```

### Bulk Generation
```bash
POST /api/reports/automation/bulk-generate
{
  "reportIds": ["sample1", "sample2", "sample3"],
  "options": {
    "reportType": "COA",
    "format": "PDF",
    "customerId": "cust-123"
  }
}
```

### Report Reissue
```bash
POST /api/reports/automation/reissue/{reportNo}
{
  "reason": "Customer requested updated format",
  "options": {}
}
```

### Preview Report
```bash
POST /api/reports/automation/preview
GET /api/reports/automation/{reportId}/preview
```

### Release Report
```bash
PUT /api/reports/automation/{reportId}/release
{
  "signatures": [{
    "role": "QC Manager",
    "type": "PKI",
    "data": "base64..."
  }],
  "autoDistribute": true,
  "distributionChannels": ["EMAIL", "SAP"]
}
```

### Verify Report
```bash
GET /api/reports/automation/verify/{verifyCode}
```

### Download Report
```bash
GET /api/reports/automation/{reportId}/download
```

## Merge Field Reference

### Header Fields
- `{{report_no}}` - Report number
- `{{report_date}}` - Generation date
- `{{version}}` - Report version
- `{{customer.name}}` - Customer name
- `{{customer.code}}` - Customer code
- `{{customer.logo}}` - Logo URL

### Purchase Order
- `{{po.number}}` - PO number
- `{{po.line}}` - Line item
- `{{part.number}}` - Part number
- `{{part.drawing_rev}}` - Drawing revision

### Traceability
- `{{trace.heat_no}}` - Heat number
- `{{trace.batch_no}}` - Batch number
- `{{trace.supplier}}` - Supplier name
- `{{trace.mtc_no}}` - MTC number

### Test Data Tables
- `{{table:chemistry}}` - Chemical composition table
- `{{table:mechanical}}` - Mechanical properties
- `{{table:hardness}}` - Hardness results
- `{{table:impact}}` - Impact test results
- `{{table:ndt}}` - NDT results

### Verification
- `{{qr_code}}` - QR code image
- `{{checksum}}` - Document checksum
- `{{signatures}}` - Signature blocks

## Business Rules Enforced

1. **BR-01**: Reports only released if all mandatory tests pass
2. **BR-02**: No material consumption without released reports
3. **BR-03**: Lot splitting maintains traceability
4. **BR-04**: Immutable instrument readings
5. **BR-05**: Auto-calculated verdicts based on specs

## Performance Targets

- Single report: ≤ 15s (P95)
- Bulk 100 reports: < 10 min
- Verification lookup: < 100ms

## Database Schema

The module uses extended Prisma models:
- `GeneratedReport` - Main report records
- `ReportTemplate` - Customer templates
- `ReportSignature` - Digital signatures
- `ReportActivity` - Audit log
- `ReportDistribution` - Distribution tracking
- `ReportVerification` - QR verification

## Queue Processing

Uses Bull queues for async processing:
- `report-generation` - PDF/document generation
- `report-distribution` - Email/SAP/webhook delivery

## Configuration

Environment variables:
```env
REPORT_VERIFICATION_URL=https://reports.example.com/verify
REDIS_HOST=localhost
REDIS_PORT=6379
S3_BUCKET=report-storage
```

## Testing

```bash
# Generate test report
npm run test:report-generation

# Test verification
curl http://localhost:4000/api/reports/verify/ABC123
```

## Future Enhancements

- [ ] Advanced analytics dashboard
- [ ] Multi-plant support
- [ ] Blockchain verification
- [ ] AI-powered anomaly detection
- [ ] Mobile app integration