# Project Structure

This document describes the new, flatter project structure organized by tabs with comprehensive cleanup improvements and simplified imports.

## Overview

The project is organized around the three main tabs in the application:
1. **Transaction Inspector** - Main transaction functionality
2. **Live Actions** - Live actions functionality  
3. **Rationale Generator** - Rationale creation functionality

## Final Directory Structure

```
src/
├── app/                          # Next.js app directory (minimal)
│   ├── page.tsx                 # Main page with tabs
│   ├── layout.tsx               # App layout
│   ├── globals.css              # Global styles
│   ├── tx/                      # Transaction route
│   └── api/                     # API routes
├── components/                   # All React components (tab-based)
│   ├── transaction-inspector/    # Tab 1: Transaction Inspector
│   │   ├── TransactionInspector.tsx
│   │   ├── SignTransaction.tsx
│   │   ├── SignTransaction.test.tsx
│   │   ├── ValidationChecks.tsx
│   │   ├── VoteValidationChecks.tsx
│   │   ├── VotingDetails.tsx
│   │   └── HierarchyDetails.tsx
│   ├── live-actions/            # Tab 2: Live Actions
│   │   └── LiveActions.tsx
│   ├── rationale-generator/     # Tab 3: Rationale Generator
│   │   └── RationaleGenerator.tsx
│   ├── wallet/                  # Shared across tabs
│   │   ├── Wallet.tsx
│   │   ├── WalletDetails.tsx
│   │   └── WalletDetails.test.tsx
│   └── shared/                  # Shared components across tabs
│       ├── downloadFiles.tsx
│       ├── fileUploader.tsx
│       ├── infoHover.tsx
│       ├── transactionDetailsActions.tsx
│       └── validationCheckItem.tsx
├── utils/                       # Consolidated utility functions
│   ├── cardano.ts              # Cardano-specific utilities
│   ├── validation.ts           # Validation logic
│   └── onChainData.ts          # On-chain data utilities
├── types/                       # TypeScript types (flat structure)
│   ├── types.ts                # Main types
│   ├── defaultStates.ts        # Default state values
│   └── jest.d.ts               # Jest type definitions
├── lib/                         # Configuration and static assets
│   ├── constants/              # Application constants
│   │   └── infoMessages.ts
│   └── templates/              # Template files
│       └── cardano-file-templates/
│           ├── cip136-template.json
│           └── txWitnessTemplate.json
└── providers/                   # React context providers
    └── MeshProvider.tsx
```

## Key Improvements Made

### 1. **Tab-Based Organization**
- ✅ Components are grouped by which tab they belong to
- ✅ Easy to find and modify tab-specific functionality
- ✅ Clear ownership of components

### 2. **Much Flatter Structure**
- ✅ Maximum 3 levels deep (down from 4-5 levels)
- ✅ No confusing nested directories
- ✅ Consistent patterns across the codebase

### 3. **Consolidated Utilities**
- ✅ Combined `txUtils.ts` and `txValidationUtils.ts` into `cardano.ts` and `validation.ts`
- ✅ Better organization by functionality
- ✅ Cleaner imports and exports

### 4. **Reorganized Configuration**
- ✅ Moved constants and templates to `lib/` directory
- ✅ Better separation of concerns
- ✅ Easier to find configuration files

### 5. **Co-located Tests**
- ✅ Test files are now next to their components
- ✅ Easier to maintain and find related tests
- ✅ Better discoverability

### 6. **Simplified Import Structure**
- ✅ **Removed all index files** for simplicity
- ✅ All imports use direct file paths
- ✅ No more complex export/import chains
- ✅ Easier to understand and maintain

### 7. **Removed Complexity**
- ✅ Eliminated `molecules/` subdirectories
- ✅ Removed unnecessary nesting
- ✅ Cleaned up old files and references
- ✅ Removed over-engineered index file system

## Import Examples

```typescript
// Simple and direct imports (no index files needed)
import Wallet from "@/components/wallet/Wallet";
import { TransactionButton } from "@/components/transaction-inspector/TransactionInspector";
import { LiveActions } from "@/components/live-actions/LiveActions";
import { CreateRationale } from "@/components/rationale-generator/RationaleGenerator";

// Shared components
import DownloadButton from "@/components/shared/downloadFiles";
import FileUploader from "@/components/shared/fileUploader";
import InfoWithTooltip from "@/components/shared/infoHover";

// Utilities
import { decodeHexToTx, convertGAToBech } from "@/utils/cardano";
import { isPartOfSigners, hasCertificates } from "@/utils/validation";

// Constants and types
import { TOOLTIP_MESSAGES } from "@/lib/constants/infoMessages";
import { TxValidationState } from "@/types/types";
```

## Cleanup Completed

### Files Reorganized
- ✅ All components moved to tab-based structure
- ✅ Tests co-located with components
- ✅ Utilities consolidated and reorganized
- ✅ Constants and templates moved to `lib/`

### Imports Updated
- ✅ **All index files removed** for simplicity
- ✅ All import statements updated to use direct file paths
- ✅ Consistent use of new structure
- ✅ No broken references

### Files Removed
- ✅ Old utility files (`txUtils.ts`, `txValidationUtils.ts`)
- ✅ **All index files** (`components/index.ts`, `utils/index.ts`, etc.)
- ✅ Empty directories cleaned up
- ✅ `.DS_Store` files removed

## Benefits for Your Small Project

Since this is a small project that won't expand much, this structure gives you:
- **Extreme Simplicity**: Maximum 3 levels deep, easy to navigate
- **Intuitive Organization**: Find anything by thinking about which tab it belongs to
- **Direct Imports**: No complex index file chains to maintain
- **Maintainability**: Clear boundaries and consistent patterns
- **Performance**: Better tree-shaking and bundle optimization
- **Developer Experience**: Fast to find and modify any component

## Why No Index Files?

For a small project like yours, index files add unnecessary complexity:
- ❌ **Over-engineering**: Too many abstraction layers
- ❌ **Maintenance overhead**: Need to keep exports in sync
- ❌ **Import confusion**: Harder to trace where things come from
- ❌ **Bundle size**: Can prevent tree-shaking in some cases

**Direct imports are simpler and more maintainable** for small projects! 🎯

The new structure is much cleaner, more maintainable, and follows the KISS principle (Keep It Simple, Stupid)! 🚀
