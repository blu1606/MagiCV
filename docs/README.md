# MagicCV Documentation

> Comprehensive documentation for MagicCV - AI-Powered CV Generator

---

## 📚 Documentation Structure

### 🧪 [Testing](./testing/)
Unit testing documentation and specifications
- [Test Matrix](./testing/test-matrix.md) - Detailed test case specifications
- [Development History](./testing/development-history.md) - Testing development process

### 🔧 [API](./api/)
API routes and endpoint documentation
- [Routes Summary](./api/routes.md) - Complete routes overview
- [Testing Endpoints](./api/testing-endpoints.md) - API testing guide

### ✨ [Features](./features/)
Feature-specific documentation

#### JD Matching
- [Flow](./features/jd-matching/flow.md) - JD matching workflow
- [Implementation](./features/jd-matching/implementation.md) - Implementation details
- [Testing Guide](./features/jd-matching/testing-guide.md) - How to test JD matching

### 💻 [Development](./development/)
Development guides and analysis
- [Gap Analysis](./development/gap-analysis.md) - Implementation gap analysis
- [Remaining Tasks](./development/remaining-tasks.md) - Outstanding work items

### 📖 [Guides](./guides/)
How-to guides and utilities
- [Debug Buttons](./guides/debug-buttons.md) - Debug UI components

### 📋 [Planning](./planning/)
Project planning and demo documentation
- [MVP Plan](./planning/mvp-plan.md) - Minimum viable product plan
- [Demo Implementation](./planning/demo-implementation.md) - Demo implementation summary

---

## 🚀 Quick Start

### For Developers
1. Read [Testing Guide](./testing/development-history.md) for testing setup
2. Check [API Routes](./api/routes.md) for endpoint reference
3. Review [JD Matching Flow](./features/jd-matching/flow.md) for feature understanding

### For Testers
1. Start with [Test Matrix](./testing/test-matrix.md)
2. Follow [JD Matching Testing Guide](./features/jd-matching/testing-guide.md)
3. Use [Testing Endpoints](./api/testing-endpoints.md) for API testing

### For Product Managers
1. Review [JD Matching Flow](./features/jd-matching/flow.md)
2. Check [Remaining Tasks](./development/remaining-tasks.md)
3. See [Gap Analysis](./development/gap-analysis.md) for implementation status

---

## 🗂️ Project Documentation

- [Main README](../README.md) - Project overview
- [Project Documentation](../PROJECT_DOCUMENTATION.md) - Complete project docs

---

## 📝 Contributing to Docs

When adding new documentation:

1. **Place files in appropriate folders**:
   - Testing docs → `/docs/testing/`
   - API docs → `/docs/api/`
   - Feature docs → `/docs/features/[feature-name]/`
   - Development docs → `/docs/development/`
   - Guides → `/docs/guides/`
   - Planning docs → `/docs/planning/`

2. **Use clear naming**:
   - Lowercase with hyphens: `jd-matching-flow.md`
   - Descriptive: `test-matrix.md`, not `tm.md`

3. **Update this README**:
   - Add links to new documents
   - Keep structure organized

---

## 🏗️ Architecture

```
docs/
├── README.md (this file)
├── testing/
│   ├── test-matrix.md
│   └── development-history.md
├── api/
│   ├── routes.md
│   └── testing-endpoints.md
├── features/
│   └── jd-matching/
│       ├── flow.md
│       ├── implementation.md
│       └── testing-guide.md
├── development/
│   ├── gap-analysis.md
│   └── remaining-tasks.md
├── guides/
│   └── debug-buttons.md
└── planning/
    ├── mvp-plan.md
    └── demo-implementation.md
```

---

**Last Updated**: 2025-11-01
**Maintained By**: MagicCV Development Team
