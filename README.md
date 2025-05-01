# @nomyx/gundb

A TypeScript wrapper for GunDB that provides schema validation, enhanced error handling, logging, middleware support, and more.

[![npm version](https://img.shields.io/npm/v/@nomyx/gundb.svg)](https://www.npmjs.com/package/@nomyx/gundb)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Overview

@nomyx/gundb extends the capabilities of [GunDB](https://gun.eco/) by providing:

- TypeScript support with full type definitions
- Schema validation using Joi
- MongoDB-like querying capabilities using sift
- Enhanced error handling and typed errors
- Configurable logging with Winston
- Koa middleware integration
- Concurrency control with Mutex

This library is ideal for TypeScript projects that want to leverage GunDB's real-time, decentralized database capabilities with additional structure and safety.

## Installation

```bash
npm install @nomyx/gundb
```

## Quick Start

```typescript
import { createGun, createDatabase } from '@nomyx/gundb';
import Joi from 'joi';

// Define a user schema
interface User {
  id?: string;
  name: string;
  email: string;
  age: number;
}

// Initialize Gun
const gun = createGun();

// Create a database instance
const db = createDatabase(gun);

// Create a user model with schema validation
const userSchema = Joi.object({
  id: Joi.string(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(0).required()
});

const userModel = db.model<User>('users', userSchema);

// Now you can perform CRUD operations with schema validation
async function main() {
  try {
    // Create a user
    const user = await userModel.save({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    });
    
    console.log('User created:', user);
    
    // Find users
    const users = await userModel.find({ age: { $gte: 18 } });
    console.log('Adult users:', users);
    
    // Update a user
    if (user.id) {
      const updatedUser = await userModel.update(user.id, { age: 31 });
      console.log('Updated user:', updatedUser);
    }
    
    // Count users
    const count = await userModel.count({ name: 'John Doe' });
    console.log('User count:', count);
    
    // Delete a user
    if (user.id) {
      await userModel.delete(user.id);
      console.log('User deleted');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
```

## Configuration

The library can be configured using environment variables or by passing a config object:

```typescript
import { createGun, Config } from '@nomyx/gundb';

// Configure using environment variables (via .env file)
// PORT=8765
// GUN_PEERS=https://gun-server1.com,https://gun-server2.com
// LOG_LEVEL=debug
// ENABLE_LOG_ROTATION=true

// Or configure programmatically
const config: Partial<Config> = {
  port: 8765,
  gunPeers: ['https://gun-server1.com', 'https://gun-server2.com'],
  logLevel: 'debug',
  enableLogRotation: true
};

const gun = createGun(config);
```

## API Documentation

### Main Exports

```typescript
import {
  createGun,
  createDatabase,
  defaultDatabase,
  errorHandler,
  ValidationError,
  DatabaseError,
  NotFoundError,
  ConflictError,
  logger,
  Config
} from '@nomyx/gundb';
```

### Database Class

The `Database` class provides a way to create models with schema validation.

#### Methods

- `model<T>(name: string, schema: ObjectSchema<T>): Model<T>` - Creates or retrieves a model with the given name and schema

### Model Class

The `Model` class provides CRUD operations for working with GunDB data.

#### Methods

- `save(data: T): Promise<T>` - Creates or updates a document
- `find(query: Partial<T>, options?: { limit?: number; skip?: number }): Promise<T[]>` - Finds documents matching the query
- `findOne(query: Partial<T>): Promise<T | null>` - Finds a single document matching the query
- `update(key: string, data: Partial<T>): Promise<T>` - Updates a document by key
- `delete(key: string): Promise<void>` - Deletes a document by key
- `count(query: Partial<T>): Promise<number>` - Counts documents matching the query

### Error Handling

The library provides several error classes to handle different types of errors:

- `ValidationError` - Thrown when data fails schema validation
- `DatabaseError` - Thrown when a database operation fails
- `NotFoundError` - Thrown when a document is not found
- `ConflictError` - Thrown when there's a conflict in the database

Example of error handling:

```typescript
import { ValidationError, NotFoundError, DatabaseError } from '@nomyx/gundb';

try {
  const user = await userModel.save({ name: 'Invalid User' });
} catch (err) {
  if (err instanceof ValidationError) {
    console.error('Validation failed:', err.message);
  } else if (err instanceof NotFoundError) {
    console.error('Document not found:', err.message);
  } else if (err instanceof DatabaseError) {
    console.error('Database error:', err.message);
  } else {
    console.error('Unknown error:', err);
  }
}
```

### Middleware

The library provides middleware for Koa applications:

```typescript
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { errorHandler } from '@nomyx/gundb';

const app = new Koa();

// Use the error handler middleware
app.use(errorHandler);
app.use(bodyParser());

// Your routes
app.use(async (ctx) => {
  // Your handler code
});

app.listen(3000);
```

### Logging

The library includes a configured Winston logger:

```typescript
import { logger } from '@nomyx/gundb';

logger.info('This is an info message', { user: 'john' });
logger.error('This is an error message', { error: new Error('Something went wrong') });
```

## Query Syntax

The library uses [sift.js](https://github.com/crcn/sift.js) for MongoDB-like queries:

```typescript
// Find users older than 18
const adults = await userModel.find({ age: { $gte: 18 } });

// Find users with specific name
const johns = await userModel.find({ name: 'John' });

// Find users with name containing "oh" (using regex)
const usersWithOh = await userModel.find({ name: /oh/ });

// Find users with either age 20 or name "Jane"
const results = await userModel.find({
  $or: [
    { age: 20 },
    { name: 'Jane' }
  ]
});
```

## Advanced Usage

### Concurrency Control

The library uses Mutex to prevent race conditions during writes:

```typescript
// This is safe to call from multiple concurrent contexts
await userModel.update(userId, { score: 100 });
```

### Custom Gun Peers

Connect to specific Gun peers:

```typescript
const gun = createGun({
  gunPeers: ['https://gun-peer1.com/gun', 'https://gun-peer2.com/gun']
});
```

## Examples

### User Authentication Example

```typescript
import { createGun, createDatabase } from '@nomyx/gundb';
import Joi from 'joi';
import bcrypt from 'bcrypt';

interface User {
  id?: string;
  username: string;
  passwordHash: string;
}

const gun = createGun();
const db = createDatabase(gun);

const userSchema = Joi.object({
  id: Joi.string(),
  username: Joi.string().required(),
  passwordHash: Joi.string().required()
});

const userModel = db.model<User>('users', userSchema);

async function register(username: string, password: string) {
  // Check if user already exists
  const existing = await userModel.findOne({ username });
  
  if (existing) {
    throw new Error('Username already taken');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Save user
  return userModel.save({
    username,
    passwordHash
  });
}

async function login(username: string, password: string) {
  // Find user
  const user = await userModel.findOne({ username });
  
  if (!user) {
    throw new Error('Invalid username or password');
  }
  
  // Verify password
  const valid = await bcrypt.compare(password, user.passwordHash);
  
  if (!valid) {
    throw new Error('Invalid username or password');
  }
  
  return user;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.