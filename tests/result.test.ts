import { Result, ResultErr } from '../src'

class MyError extends ResultErr {
  public override readonly _tag = 'MyError'
}

describe('Result', () => {
  test('Ok variant behaves correctly', () => {
    const okResult = Result.ok(42)

    expect(okResult.isOk).toBe(true)
    expect(okResult.isErr).toBe(false)
    expect(okResult.value).toBe(42)
    expect(okResult.getOrDefault(0)).toBe(42)
    expect(okResult.getOrElse(() => 0)).toBe(42)
    expect(okResult.getOrNull()).toBe(42)
    expect(okResult.errOrNull()).toBeNull()
    expect(okResult.getOrThrow()).toBe(42)
    expect(okResult.toString()).toBe('Ok(42)')

    const mapped = okResult.map(x => x + 1)
    expect(mapped.isOk).toBe(true)
    expect(mapped.value).toBe(43)

    expect(okResult.fold(x => x * 2, () => -1)).toBe(84)

    const json = okResult.toJSON()
    expect(json).toEqual({ value: 42, isOk: true, isErr: false })
  })

  test('Err variant behaves correctly', () => {
    const errObj = new MyError('failed')
    const errResult: Result<number, MyError> = Result.err(errObj)

    expect(errResult.isOk).toBe(false)
    expect(errResult.isErr).toBe(true)
    expect(errResult.value).toBe(errObj)
    expect(errResult.getOrDefault(0)).toBe(0)
    expect(errResult.getOrElse(e => e.message.length)).toBe(errObj.message.length)
    expect(errResult.getOrNull()).toBeNull()
    expect(errResult.errOrNull()).toBe(errObj)
    expect(() => errResult.getOrThrow()).toThrow(errObj)
    expect(errResult.toString()).toBe(`Err(${errObj.message})`)

    const mapped = errResult.map(() => 123)
    expect(mapped.isErr).toBe(true)
    expect(mapped.errOrNull()).toBe(errObj)

    expect(errResult.fold(() => 'ok', e => `err:${e.message}`)).toBe('err:failed')

    const json = errResult.toJSON()
    expect(json.isOk).toBe(false)
    expect(json.isErr).toBe(true)
    expect(json.value).toBe(errObj)
  })
})