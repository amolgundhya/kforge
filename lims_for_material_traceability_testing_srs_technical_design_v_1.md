# Project Title
**Quality Lab & Material Traceability System (QLMTS)**

**Version:** 1.0  
**Owner:** Gunadhya Software Solutions  
**Date:** 15 Sep 2025  
**Scope:** MVP → scalable enterprise roll‑out (Steel/Metals/Manufacturing)

---

## 1. Executive Summary
QLMTS is a Lab Information Management System (LIMS) focused on end‑to‑end material traceability, laboratory testing, automated reporting, and enterprise integrations (SAP ERP and lab instruments). The MVP prioritizes heat/batch traceability, MTC management, chemical/mechanical/NDT test capture, report automation, and an auditable approval workflow.

---

## 2. Goals & Non‑Goals
**Goals**
1. Single source of truth for material identity (heat, batch, supplier, MTC).  
2. Digitize lab workflows (sample registration → testing → QC approval → final report).  
3. Capture test results from instruments (spectrometer, UTM, hardness, NDT) with minimal manual entry.  
4. Generate standard‑compliant reports (ISO/ASTM/EN) + customer templates.  
5. Integrate with SAP for purchase, GRN, production orders, and inventory links.  
6. Provide e‑signatures, audit trails, and compliance logs.

**Non‑Goals (Phase‑1)**
- Advanced SPC, Six‑Sigma dashboards (can be Phase‑2).  
- Advanced calibration module (basic due dates + attachments only in MVP).  
- Multi‑plant multi‑timezone complexities (MVP targets one plant; architecture supports scale).

---

## 3. Stakeholders & Users
- **Quality Head (QC Manager)** — owns standards, final approval.  
- **Lab Engineers/Technicians** — run tests, capture results.  
- **Procurement/Stores** — reference MTCs, GRNs, supplier lots.  
- **Production/Planning** — view material fitness for use; link to work orders.  
- **Sales/Customer Service** — access customer‑specific reports.  
- **IT/ERP Team** — manage integrations, security, backups.  
- **Auditors/Regulatory** — read‑only + audit logs.

---

## 4. Functional Requirements (SRS)

### 4.1 Material Traceability
**FR‑MT‑01** Create/maintain master records for **Heat**, **Batch/Lot**, **Material Grade**, **Specification**, **Supplier**, **PO/GRN** references.  
**FR‑MT‑02** Capture **Heat Number**, **Batch Number**, **Supplier Details** (name, code, CoC), **Material Grade**, **Size/Dimensions**, **Received Qty/Unit**, **PO/GRN/Line**, **MTC attachment(s)**.  
**FR‑MT‑03** Link heats/batches to downstream **Production Orders**, **Work Centers**, **Finished Components**.  
**FR‑MT‑04** Support **lot splitting/merging** with lineage graph.  
**FR‑MT‑05** Search & filter by heat, batch, supplier, date, grade, PO/GRN, status.  
**FR‑MT‑06** MTC Management: upload, parse key fields (OCR optional), versioning, validity.

### 4.2 Testing Parameters
**FR‑TP‑01 Chemical**: record **spectro/ICP** results (%C, %Mn, %Si, etc.) vs spec limits; auto PASS/FAIL.  
**FR‑TP‑02 Mechanical**: **tensile (UTS, YS, El%), hardness (HB/HRC/HV), impact (Charpy), fatigue**; capture raw + derived values; specimen ID linkage.  
**FR‑TP‑03 NDT**: **UT, MPI, DPT/DP, RT** — record method, standard, indication types, acceptance class, disposition.  
**FR‑TP‑04** Test **methods** mapped to **Standards** (ISO/ASTM/EN, company spec), **equipment**, **calibration due date**, **operator**.  
**FR‑TP‑05** Attach raw files (CSV, PDF, images of indications), run parameters, environment notes.  
**FR‑TP‑06** Instrument connectivity (Phase‑1 adapters; see §7).  
**FR‑TP‑07** Auto calculations, units conversion, rounding policy.

### 4.3 Report Automation
**FR‑RA‑01** Auto‑generate reports in **PDF/Excel/Word**.  
**FR‑RA‑02** Support **standard formats** per ISO/ASTM/EN + internal SOP templates.  
**FR‑RA‑03** **Customer templates** with logos/fields; per‑customer default mapping.  
**FR‑RA‑04** Include **QR code**/hash for authenticity; version & reissue with watermark.  
**FR‑RA‑05** Bulk generation and email dispatch with access control.  
**FR‑RA‑06** Multi‑language labels (EN + configurable).

### 4.4 Workflow & Approval
**FR‑WF‑01** State machine: **Draft → Testing → Review → QC Approval → Released → Rejected/Rework**.  
**FR‑WF‑02** Parallel review (metallurgy + NDT) and consolidated sign‑off.  
**FR‑WF‑03** **Digital signatures** (PKI, certificate mapping, timestamp).  
**FR‑WF‑04** **Audit trail** for every field change (who, when, old/new).  
**FR‑WF‑05** Rework loop with reason codes, CAPA references.  
**FR‑WF‑06** Notifications (email/in‑app) at stage gates; SLA tracking.

### 4.5 Integration
**FR‑INT‑01 SAP**: Pull **PO/GRN**, material master, suppliers; push **test outcomes**, **COA/MTC references**, **usage decision** flags.  
**FR‑INT‑02 Instruments**: Spectrometer, UTM, hardness testers, NDT devices via **RS‑232/USB/TCP**, CSV polling, or vendor SDKs.  
**FR‑INT‑03 Directory/SSO**: Azure AD/Okta/LDAP for user provisioning.  
**FR‑INT‑04 Email (SMTP)** and Webhooks for external systems.

### 4.6 Security & Access Control
**FR‑SEC‑01** RBAC: roles (Admin, QC Manager, Lab Tech, Stores, Prod, Auditor, Customer‑view).  
**FR‑SEC‑02** Row‑level access by plant/customer as needed.  
**FR‑SEC‑03** Data retention policies; legal holds; export on request.  
**FR‑SEC‑04** E‑sign compliance log (signer identity, purpose, hash).

### 4.7 Usability
- Responsive web UI; barcode/QR scanning for heat/batch/sample IDs.  
- Bulk actions, import wizards, quick search, saved views.  
- Accessibility (WCAG 2.1 AA), keyboard‑first data entry.

---

## 5. Data Model (Logical)

### 5.1 Core Entities
- **Material** (grade, spec, category)
- **Heat** (heat_no, supplier_id, mtc_id, chem_baseline, received_on)
- **Batch/Lot** (batch_no, heat_id, qty, unit, location, split_parent_id)
- **Supplier** (code, name, contact)
- **PO** / **GRN** (erp_ids, lines, qty)
- **MTC** (doc_id, supplier_mtc_no, file_uri, parsed_fields JSON)
- **Sample** (sample_id, source_type[heat/batch/finished], linked_id, purpose, test_plan_id)
- **TestPlan** (per grade/spec/customer; list of required tests & limits)
- **Test** (test_id, sample_id, method, standard, equipment_id, operator_id, status)
- **TestResult** (name, value, unit, min/max/target, verdict)
- **NDTIndication** (type, size, location, severity, disposition)
- **Equipment** (type, make/model, ser_no, calib_due, files)
- **Approval** (stage, approver_id, sign_hash, timestamp)
- **Report** (report_no, template_id, file_uri, version, checksum)
- **CustomerTemplate** (customer_id, template_def, output_type)
- **AuditLog** (entity, entity_id, field, old, new, by, at)

### 5.2 Key Relationships
- Heat 1‑to‑Many Batches; Batch many‑to‑many Production Orders via usage table.  
- Sample belongs to Heat/Batch; Sample 1‑to‑Many Tests; Test 1‑to‑Many TestResults.  
- Report links to Sample/Order/Customer + Template.

### 5.3 Data Dictionary (selected)
| Entity | Field | Type | Rules |
|---|---|---|---|
| Heat | heat_no | string(50) | unique, regex `^[A‑Za‑z0‑9\-\/\.]+$` |
| Heat | supplier_id | FK | mandatory |
| MTC | supplier_mtc_no | string(50) | unique per supplier |
| Sample | sample_id | ULID | barcode/QR encoded |
| TestResult | value | decimal(12,5) | unit conversion table |
| Approval | sign_hash | sha256 | computed on canonical JSON |

---

## 6. Business Rules
- **BR‑01** A report can be **Released** only if all mandatory tests in the **TestPlan** are **PASS** or have approved deviations.  
- **BR‑02** Heat/Batch cannot be **Consumed** in production if linked report status ≠ **Released** (configurable override).  
- **BR‑03** Lot splitting must carry forward lineage and proportionate quantities.  
- **BR‑04** Instrument readings are immutable; corrections require **Deviation** with reason + e‑sign.  
- **BR‑05** Standard limits are versioned; verdicts store the evaluated limit version.

---

## 7. Integrations — Technical

### 7.1 SAP (ERP)
**Patterns**:  
- **Inbound (to QLMTS)**: PO/GRN, Material Master, Vendor Master via **OData/REST**, **IDoc (ORDERS/MBGMCR/MASTER)**, or flat‑file SFTP.  
- **Outbound (to SAP)**: Inspection results summary, usage decision (QE01 equivalents), Report/COA link as URL/document, stock status.

**Transport**: HTTPS mutual TLS; retry with back‑off; dead‑letter queue.

**Mapping (illustrative)**:
- `SAP PO → PO` (header/lines), `EKKO/EKPO`
- `SAP GRN → GRN` (`MSEG`, movement type 101)
- `Material` (`MARA/MARC`), `Vendor` (`LFA1`)
- `Usage Decision` (`QALS/QAVE`) ↔ QLMTS `Report.verdict`

### 7.2 Instruments
**Adapters (Phase‑1)**:  
- **Spectrometer**: CSV file drop (watched folder) or serial RS‑232 → parser → TestResult rows.  
- **UTM**: Vendor CSV/XML or TCP socket; derive UTS/YS/El%.  
- **Hardness**: RS‑232 text protocol; map to HB/HRC/HV.  
- **NDT**: Operator inputs + attachments; later phased SDK integration.

**Connector Service** (edge agent): Windows/Linux service near instruments; queues payloads to broker (RabbitMQ/Kafka) → API. Offline buffering, checksum, replay.

---

## 8. Report Engine
- **Template Types**: Standard (ISO/ASTM/EN), Customer‑specific, Internal MTC.  
- **Renderer**: DOCX template with merge fields → PDF; **Excel** via XLSX template; programmatic QR/code128.  
- **Versioning**: Every regeneration increments minor version; reissue watermark; checksum stored.  
- **Language/Units**: label bundles + unit map; rounding per method.

---

## 9. Workflow & E‑Signature
- **State Machine**: Configurable per sample type.  
- **Approvals**: Named approvers; substitution rules; escalation SLAs.  
- **E‑Sign**: PKI (X.509) mapped to user; hash of canonical payload (report JSON + attachments hash) signed; RFC 3161 timestamp.  
- **Audit Trail**: Immutable append‑only store (WORM bucket + DB log).

---

## 10. Non‑Functional Requirements (NFRs)
- **Availability** 99.5% (MVP single plant); **RPO** 15 min; **RTO** 2 hrs.  
- **Performance**: Search < 1s P95; report generation < 15s P95 (single).  
- **Scalability**: Horizontal web/API; async job workers.  
- **Security**: OWASP ASVS L2; encryption at rest (KMS) & in transit (TLS1.2+); SSO (OIDC/SAML).  
- **Compliance**: ISO 17025 support (lab), ISO 9001 traceability; e‑signature log meets IT Act/eIDAS intent (legal team to validate).  
- **Observability**: Central logs, metrics, audit dashboards.  
- **Backups**: Hourly WAL, daily full; 30‑day retention.

---

## 11. Tech Stack & Architecture

### 11.1 Suggested Stack
- **Frontend**: React (Next.js), TypeScript, Tailwind, Zustand/Redux, React Query.  
- **Backend**: **NestJS (Node.js)** *or* **FastAPI (Python)**; pick one.  
- **DB**: PostgreSQL (row‑level security ready); Timescale/JSONB for instrument payloads.  
- **Search**: PostgreSQL FTS; optional OpenSearch for scale.  
- **Messaging**: RabbitMQ/Kafka (instrument & SAP integration).  
- **Storage**: S3‑compatible (MinIO/AWS S3) for reports/MTCs.  
- **Auth**: Keycloak/Azure AD (OIDC).  
- **CI/CD**: GitHub Actions; Docker; Kubernetes (on‑prem or cloud).  
- **Reporting**: Docx‑templater/Carbone.js; wkhtmltopdf/Chromium headless.

### 11.2 High‑Level Diagram (textual)
`UI → API GW → Services (Traceability, Lab, Reporting, Workflow, Integration) → DB`  
`Instruments/Edge Agents → Message Broker → Integration Service → API`  
`SAP ↔ Integration Service (OData/IDoc/Webhook)`

### 11.3 Service Boundaries
- **Traceability Service** (heats/batches, lineage).  
- **Lab Service** (samples, tests, plans, results).  
- **Reporting Service** (templates, rendering, distribution).  
- **Workflow Service** (states, approvals, e‑sign, audit).  
- **Integration Service** (SAP, instruments, SSO, email/webhooks).  
- **Files Service** (MTC, attachments, WORM bucket management).

---

## 12. API Design (Representative)
**Auth**: OIDC bearer JWT; scopes per service.

**Material & Traceability**
- `POST /heats` — create heat  
- `GET /heats?heat_no=` — search  
- `POST /batches` — create batch / split  
- `GET /lineage/{batch_id}` — upstream/downstream graph

**Lab & Testing**
- `POST /samples` — register sample (source, plan)  
- `POST /tests` — create tests from plan  
- `POST /tests/{id}/results` — add results  
- `POST /ingest/instrument` — signed payload from edge agent

**Workflow & Reports**
- `POST /samples/{id}/submit`  
- `POST /samples/{id}/approve` (e‑sign)  
- `POST /reports/{id}/render?format=pdf`  
- `GET /reports/{id}` — fetch artifact

**Integrations**
- `POST /sap/inbound/po` — PO/GRN upsert  
- `POST /webhooks/report-released` — notify external

**Error Model**: RFC7807 problem+json; idempotency keys for ingest endpoints.

---

## 13. UI/UX — Key Screens
1. **Dashboard** (open items, SLA breaches, instrument connectivity).  
2. **Heat/Batch Register** (create, import, lineage view).  
3. **Sample Registration** (scan, select plan, auto‑tests).  
4. **Test Entry** (tabular, units, auto‑verdict; instrument feed indicator).  
5. **NDT Panel** (indication mapping, image upload, disposition).  
6. **Report Preview** (template dropdown, watermark, QR code).  
7. **Workflow & Approvals** (multi‑approver timeline, e‑sign pad/token).  
8. **MTC Library** (OCR parse, compare vs spec).  
9. **Audit Explorer** (diffs, who/when).  
10. **Admin** (limits library, templates, equipment, users/roles).

---

## 14. Validation & Testing
- **Unit Tests**: services, calculations, verdict logic.  
- **Integration Tests**: SAP mock, instrument simulators, report engine.  
- **UAT Scenarios**:
  - Create heat → register sample → ingest spectro CSV → auto verdict → QC approve → render PDF → push usage to SAP.  
  - Split batch → re‑test subset → reissue report v1.1 with watermark.  
  - NDT with indications → reject → CAPA link → rework → release.

- **Performance Tests**: 100 concurrent report renders; 10k/day instrument reads.  
- **Security Tests**: RBAC, IDOR, SQLi, stored XSS, e‑sign tamper.

---

## 15. Migration & Master Data
- Import suppliers, materials, specs, historical MTCs (CSV/XLSX).  
- De‑duplication rules (heat_no + supplier_id).  
- Backfill links to SAP using keys (PO/GRN/Material).

---

## 16. Deployment & Environments
- **Envs**: DEV, UAT, PROD.  
- **On‑Prem** (factory) or **Cloud** (private VPC); edge agents remain on‑prem.  
- **Secrets**: Vault; rotation policy.  
- **Monitoring**: Grafana/Prometheus; alerts for instrument lag, SAP queue backlog.

---

## 17. Risks & Mitigations
- **Instrument vendor lock‑in** → adapter abstraction; CSV failover.  
- **SAP variability** → contract per plant; feature flags.  
- **Data quality (OCR)** → human in loop; confidence thresholds.  
- **Change management** → sandbox + training; phased go‑live.

---

## 18. Roadmap (MVP → Phase‑2)
**MVP (8–12 weeks)**  
- Traceability core, Sample/Test, Instrument CSV ingest, Report PDF, Workflow & e‑sign, SAP PO/GRN pull, role model.

**Phase‑2**  
- Advanced SPC dashboards; SDK instrument integrations; bilingual reports; mobile app for shop‑floor scan; calibration module; multi‑plant & customer portal.

---

## 19. Acceptance Criteria (Sample)
- Can search any **heat** within 1s by heat_no, supplier, PO.  
- Upload **MTC** and auto‑parse grade and key chemistry fields with ≥ 95% accuracy on clean PDFs.  
- Ingest **spectro CSV** and auto‑create **TestResults** mapped to the sample; verdicts computed per **TestPlan**.  
- **Released** report contains QR code that resolves to an immutable copy; checksum matches DB.  
- **Audit log** shows who changed any limit and which report used which limit version.  
- **SAP** receives usage decision within 30s of release (success P95).

---

## 20. Sample Templates & Payloads

### 20.1 Spectro CSV (example)
```
SampleID, C, Mn, Si, P, S, Cr, Ni, Mo
S‑2025‑000123, 0.19, 1.15, 0.35, 0.014, 0.010, 0.50, 0.05, 0.02
```

### 20.2 TestPlan JSON (snippet)
```json
{
  "material_grade": "ASTM A105",
  "tests": [
    {"method": "CHEM_SPECTRO", "limits": {"C": {"max": 0.35}, "Mn": {"min": 0.60, "max": 1.35}}},
    {"method": "TENSILE", "limits": {"UTS": {"min": 485}, "YS": {"min": 250}, "El": {"min": 22}}},
    {"method": "HARDNESS", "limits": {"HRC": {"max": 22}}}
  ]
}
```

### 20.3 Report Merge Fields (DOCX)
- {{report_no}}, {{report_date}}, {{customer_name}}, {{heat_no}}, {{batch_no}}  
- {{material_grade}}, {{spec}}  
- {{table:chemistry}}, {{table:mechanical}}, {{table:ndt}}  
- {{qr_code}}, {{signatures}}

---

## 21. Configuration Catalog
- **Materials/Grades**; **Standards**; **Test Methods**; **Limits**; **Customers**; **Templates**; **Equipment**; **Users/Roles**; **Workflow definitions**; **Instrument adapters**; **SAP endpoints**; **Email SMTP**.

---

## 22. Open Items / Assumptions
- Customer count for custom templates in MVP (≤ 10 assumed).  
- SAP interface variant (OData vs IDoc) to be finalized with IT.  
- Instrument makes/models and protocol docs to be provided.  
- Legal sign‑off on e‑signature approach.

---

## 23. Appendix — Sample Test Methods Library (Seed)
- **CHEM_SPECTRO** (ISO 15350/ASTM E415)  
- **CHEM_ICP** (ASTM E1479)  
- **TENSILE** (ASTM E8/E8M, ISO 6892)  
- **HARDNESS** (Brinell ASTM E10, Rockwell ASTM E18, Vickers ASTM E92)  
- **IMPACT** (Charpy ASTM E23, ISO 148‑1)  
- **FATIGUE** (ASTM E466)  
- **UT** (ASTM E114/ISO 16810), **MPI** (ASTM E709/ISO 9934), **DPT** (ASTM E165/ISO 3452)

---

## 24. Technical Design — Deep Dive

### 24.1 Schema (DDL Sketch — PostgreSQL)
```sql
create table heat (
  id uuid primary key default gen_random_uuid(),
  heat_no text unique not null,
  supplier_id uuid not null references supplier(id),
  material_grade text not null,
  received_on date,
  mtc_id uuid references mtc(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table batch (
  id uuid primary key default gen_random_uuid(),
  batch_no text not null,
  heat_id uuid references heat(id),
  qty numeric(14,3), unit text,
  split_parent_id uuid references batch(id),
  created_at timestamptz default now()
);

create table sample (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  source_type text check (source_type in ('HEAT','BATCH','FINISHED')),
  source_id uuid not null,
  test_plan_id uuid references test_plan(id),
  state text default 'DRAFT'
);

create table test (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid references sample(id),
  method text, standard text, equipment_id uuid, operator_id uuid,
  status text default 'PENDING'
);

create table test_result (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references test(id),
  name text, value numeric(14,6), unit text,
  min numeric(14,6), max numeric(14,6), verdict text
);
```

### 24.2 Sequence: Spectro Ingestion → Report
1. Technician registers **Sample** (scan heat/batch).  
2. TestPlan expands → **Tests**; spectro flagged as instrument‑fed.  
3. Edge Agent detects new CSV → posts signed payload to `/ingest/instrument`.  
4. Ingest service validates signature, schema; upserts **TestResults**.  
5. Lab screen shows auto‑verdict; technician reviews anomalies.  
6. Submit → Reviewer approves → QC e‑sign → **Report** render → push to SAP.

### 24.3 E‑Sign Algorithm
- Canonicalize report JSON (sorted keys, normalized units).  
- Compute SHA‑256; create CMS/PKCS#7 signature with user cert; embed RFC3161 timestamp; store `sign_hash`, `sign_blob`.  
- PDF includes verification panel; QR encodes API URL with checksum.

### 24.4 Authorization
- RBAC matrix per route; row‑level policies: `tenant_id`, `plant_id`.  
- Attribute‑based checks for customer templates & reports.

### 24.5 Error/Retry Semantics
- Idempotency‑Key on ingest/report endpoints (dedupe).  
- DLQ for SAP/instrument failures; operator dashboard to replay.

---

## 25. Implementation Plan (Phased)
**Sprint 0 (1–2 wks)**: Finalize SAP/instrument interfaces; seed test methods; template design.  
**S1–S2 (3–4 wks)**: Traceability + Sample/Test core; basic UI; CSV ingest.  
**S3 (2 wks)**: Workflow + e‑sign; audit log; report engine (PDF).  
**S4 (2 wks)**: SAP inbound (PO/GRN) + outbound usage; customer templates.  
**Hardening (1–2 wks)**: Perf, security, UAT fixes; training; go‑live.

---

## 26. RACI (MVP)
- **Product/Process**: Amol (A/R), QC Head (C), Lab Lead (C), SAP IT (C), Dev Lead (R), QA Lead (R).  
- **Security/Infra**: DevOps Lead (R), IT Sec (C).  
- **Change Mgt**: PM (R), HR/Training (C).

---

## 27. Reporting — Sample Layout (PDF)
- Cover: Customer, PO/GRN, Heat/Batch, Grade, Spec, Plant, Report No/Date.  
- Chemistry table (elements vs limits vs value vs verdict).  
- Mechanical table (UTS/YS/El%, Hardness, Impact).  
- NDT section (method, class, indications, disposition).  
- Approvals: Reviewer, QC (e‑sign blocks), QR, checksum.

---

## 28. KPIs & Dashboards (MVP)
- Turnaround time per test & per sample.  
- Pass/Fail by supplier/heat/grade.  
- Instrument uptime / ingest lag.  
- Rejection causes & CAPA links.

---

## 29. Security & Privacy Details
- PII minimization; customer names in reports only.  
- WORM retention for signed reports (7 years default).  
- Key rotation & cert management; audit immutability checks.

---

## 30. Glossary
- **Heat**: Metallurgical melt identification number.  
- **Batch/Lot**: Subset of material processed/received.  
- **MTC**: Mill Test Certificate.  
- **UTM**: Universal Testing Machine.  
- **NDT**: Non‑Destructive Testing.  
- **UD**: Usage Decision (SAP QM).

---

**End of Document — v1.0**

