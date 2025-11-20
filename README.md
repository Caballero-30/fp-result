# fp-result

A lightweight functional programming `Result` type for TypeScript. Provides a small, typed `Ok` / `Err` abstraction for handling success and failure without throwing.

## Features

- Strong TypeScript typings
- `Ok` and `Err` variants
- Safe accessors and combinators: `map`, `fold`, `getOrDefault`, `getOrElse`, `getOrThrow`
- JSON-serializable representation
- Built with TypeScript and distributed from `dist/` with typings (`dist/index.d.ts`)

## Install

```shell
npm install fp-result
```

## Quick Usage

```typescript
import { Result, ResultErr } from 'fp-result'

// Define a custom error that extends ResultErr and provides a `_tag`
class NotFoundError extends ResultErr {
  public override readonly _tag = 'NotFoundError'
  
  constructor(message = 'Resource not found') {
    super(message)
  }
}

// Create results
const ok = Result.ok(42)
const err = Result.err(new NotFoundError('Item 123 not found'))

// Inspect
if (ok.isOk) console.log(ok.value) // 42

console.log(err.isErr) // true
console.log(err.errOrNull()?.message) // 'Item 123 not found'

// Defaults / fallbacks
const value = err.getOrDefault(0) // 0
const computed = err.getOrElse(e => {
  console.error(e)

  return -1
})

// Transform / fold
const doubled = Result.ok(2).map(n => n * 2) // Ok(4)
const folded = err.fold(
  v => `ok: ${v}`,
  e => `err: ${e.message}`
)

// Throwing
// err.getOrThrow() // will throw the contained ResultErr subtype
```

### Error validation with `switch`

Example showing two error subtypes that extend `ResultErr` and provide the discriminant `_tag`. Using a `switch` lets TypeScript narrow the error type for case-specific handling and enforces exhaustiveness.

```typescript
import { Result, ResultErr } from 'fp-result'

class NotFoundError extends ResultErr {
  public override readonly _tag = 'NotFoundError'
  
  constructor(public readonly resource: string, message = 'Resource not found') {
    super(message)
  }
}

class ValidationError extends ResultErr {
  public override readonly _tag = 'ValidationError'
  
  constructor(public readonly field: string, message = 'Invalid value') {
    super(message)
  }
}

type OrderResult = Result<number, NotFoundError | ValidationError>

function getOrder(id: string): OrderResult {
  if (id === '1') return Result.ok(42)
  if (id === '2') return Result.err(new NotFoundError('order', `Order ${id} missing`))
  
  return Result.err(new ValidationError('id', 'Malformed id'))
}

const res = getOrder('3')
const message = res.fold(
  value => `Order id: ${value}`, // Ok handler
  err => {                       // Err handler
    switch (err._tag) {
      case 'NotFoundError':
        return `Not found: ${err.resource} — ${err.message}`
      case 'ValidationError':
        return `Validation error on \`${err.field}\`: ${err.message}`
    }
  }
)

console.log(message)
```

#### Make the `switch` exhaustiveness checked by TypeScript

To have TypeScript report non‑exhaustive `switch` statements when you use the discriminant `_tag`, disallow fallthrough in `tsconfig.json` (set `"noFallthroughCasesInSwitch": true`).

Example `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## API (summary)

- `Result.ok<T>(value: T): Result<T, never>`
- `Result.err<E extends ResultErr>(value: E): Result<never, E>`
- Instance:
  * `isOk: boolean`
  * `isErr: boolean`
  * `value: T | E`
  * `getOrDefault(defaultValue: T): T`
  * `getOrElse(onErr: (err: E) => T): T`
  * `getOrNull(): T | null`
  * `errOrNull(): E | null`
  * `getOrThrow(): T`
  * `map<U>(fn: (value: T) => U): Result<U, E>`
  * `fold<R>(ifOk: (value: T) => R, ifErr: (error: E) => R): R`
  * `toJSON(): { value: T | E, isOk: boolean, isErr: boolean }`
  * `toString(): string`
