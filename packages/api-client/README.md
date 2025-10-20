# @parkingmate/api-client

Type-safe API client for ParkingMate, auto-generated from OpenAPI specification.

## Features

- 🔒 **Type-safe**: Full TypeScript support with types generated from OpenAPI spec
- 🔄 **Auto-generated**: Types are automatically generated from the API specification
- 🎯 **Simple API**: Clean and intuitive client interface
- 🔐 **Auth support**: Built-in JWT authentication handling
- ⚡ **Lightweight**: Minimal dependencies, uses native fetch API

## Installation

This package is part of the ParkingMate monorepo and is installed automatically with workspace dependencies.

## Usage

### Basic Setup

```typescript
import { createApiClient } from '@parkingmate/api-client';

const client = createApiClient({
  baseUrl: 'http://localhost:3000/api/v1',
  timeout: 30000, // optional, default 30s
  headers: {      // optional custom headers
    'X-Custom-Header': 'value'
  }
});
```

### Authentication

```typescript
// Set JWT token
client.setAuthToken('your-jwt-token-here');

// Clear token
client.clearAuthToken();
```

### Making Requests

```typescript
// GET request
const parkingLots = await client.get('/parking-lots');
if (parkingLots.success) {
  console.log(parkingLots.data);
}

// POST request
const newLot = await client.post('/parking-lots', {
  name: 'Downtown Garage',
  address: '123 Main St',
  // ... other fields
});

// PATCH request
const updated = await client.patch('/parking-lots/123', {
  pricePerHour: '6.00'
});

// DELETE request
await client.delete('/parking-lots/123');
```

### Error Handling

```typescript
const result = await client.get('/parking-lots/invalid-id');

if (!result.success) {
  console.error('Error:', result.error);
  // result.error contains:
  // - code: error code
  // - message: error message
  // - details: optional additional info
}
```

## Generating Types

To regenerate types from the OpenAPI specification:

```bash
pnpm api:generate
```

This reads from `apps/api/openapi/spec.yaml` and generates TypeScript types in `src/generated/`.

## Development

```bash
# Build the package
pnpm build

# Watch mode
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint
```
