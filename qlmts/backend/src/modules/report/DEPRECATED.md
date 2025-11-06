# DEPRECATED: Legacy Report Module

**⚠️ This module is deprecated and incompatible with the extended Prisma schemas.**

## Why is this deprecated?

This module was designed to work with the **basic schema** (`schema.prisma`) which includes a simple `Report` model.

The extended schemas (`schema-report-automation.prisma` and `schema-complex.prisma`) use the `GeneratedReport` model instead, which is part of the **report-automation** module with much more comprehensive features.

## What should you use instead?

Use the **report-automation** module located at:
```
src/modules/report-automation/
```

This module provides:
- Advanced report generation with templates
- PDF and Excel export
- Digital signatures
- Report versioning and reissue
- Distribution tracking
- QR code verification
- Audit trails

## If you need this module

If you specifically need to use this legacy module:

1. Switch to the basic schema:
   ```bash
   cd qlmts/backend
   # Don't copy - use the basic schema.prisma directly
   npx prisma generate
   ```

2. Remove or disable the `report-automation` module from your `app.module.ts`

## Migration Path

To migrate from this module to report-automation:

1. Update your code to use the `GeneratedReport` model
2. Use the `ReportGenerationService` instead of `ReportService`
3. Adapt your DTOs to match the new schema structure
4. See `src/modules/report-automation/` for examples

## Status

- **Deprecated Since:** v1.0.0
- **Will be removed in:** v2.0.0
- **Replacement:** `src/modules/report-automation/`
