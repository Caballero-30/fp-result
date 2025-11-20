import { ResultErr } from './result-err'

/**
 * A generic `Result` type representing either a success (`Ok`) or a failure (`Err`).
 * @template T The type of the successful value.
 * @template E The type of the error, which must extend `ResultErr`.
 */
export abstract class Result<T, E extends ResultErr> {
  private readonly _value: T | E
  private readonly _isOk: boolean
  private readonly _isErr: boolean

  /**
   * Creates a new instance of the `Result` class.
   * @param value - The contained value, either of type `T` for `Ok` or type `E` for `Err`.
   * @param isOk - Whether this instance represents an `Ok` variant (`true` for `Ok`, `false` otherwise).
   * @param isErr - Whether this instance represents an `Err` variant (`true` for `Err`, `false` otherwise).
   * @protected
   */
  protected constructor(value: T | E, isOk: boolean, isErr: boolean) {
    this._value = value
    this._isOk = isOk
    this._isErr = isErr
  }

  /**
   * Indicates whether the Result is an `Ok` variant.
   * @returns `true` if the `Result` is an `Ok`, otherwise `false`.
   */
  public get isOk() {
    return this._isOk as [T] extends [never] ? false : true
  }

  /**
   * Indicates whether the Result is an `Err` variant.
   * @returns `true` if the `Result` is an `Err`, otherwise `false`.
   */
  public get isErr() {
    return this._isErr as [E] extends [never] ? false : true
  }

  /**
   * Retrieves the contained value if `Ok`, or the error if `Err`.
   * @returns The contained value of type `T` if `Ok`, or the error of type `E` if `Err`.
   */
  public get value() {
    return this._value as [T] extends [never] ? E : T
  }

  /**
   *  Retrieves the contained value if `Ok`, or returns the provided default value if `Err`.
   *  @param defaultValue The default value to return if the `Result` is `Err`.
   */
  public getOrDefault(defaultValue: T) {
    return this.isOk ? this.value as T : defaultValue
  }

  /**
   * Retrieves the contained value if `Ok`, or computes a value from the error if `Err`.
   * @param onErr A function that takes the error and returns a value of type `T`.
   */
  public getOrElse(onErr: (err: E) => T) {
    return this.isOk
      ? this.value as T
      : onErr(this.value as E)
  }

  /**
   * Serializes the `Result` to a `JSON` object.
   * @returns An object containing the value and status flags.
   */
  public toJSON() {
    return {
      value: this._value,
      isOk: this.isOk,
      isErr: this.isErr
    }
  }

  /**
   * Transforms the contained `Ok` value using the provided function, leaving `Err` unchanged.
   * @template U The type of the transformed successful value.
   * @param fn A function that takes the `Ok` value and returns a new value of type `U`.
   * @returns A new `Result` containing the transformed value or the original error.
   */
  public abstract map<U>(fn: (value: T) => U): Result<U, E>

  /**
   * Applies one of the provided functions based on whether the `Result` is `Ok` or `Err`.
   * @template R The return type of the functions.
   * @param ifOk A function to apply if the `Result` is `Ok`.
   * @param ifErr A function to apply if the `Result` is `Err`.
   * @returns The result of applying the appropriate function.
   */
  public abstract fold<R>(ifOk: (value: T) => R, ifErr: (error: E) => R): R

  /**
   * Retrieves the contained value if `Ok`, or `null` if `Err`.
   * @returns The contained value of type `T` if `Ok`, otherwise `null`.
   */
  public abstract getOrNull(): T | null

  /**
   * Retrieves the contained error if `Err`, or `null` if `Ok`.
   * @returns The contained error of type `E` if `Err`, otherwise `null`.
   */
  public abstract errOrNull(): E | null

  /**
   * Retrieves the contained value if `Ok`, or throws the contained error if `Err`.
   * @returns The contained value of type `T` if `Ok`.
   */
  public abstract getOrThrow(): T

  /**
   * Returns a string representation of the `Result`.
   * @returns A string describing the `Result`.
   */
  public abstract toString(): string

  private static Ok = class Ok<T> extends Result<T, never> {
    constructor(value: T) {
      super(value, true, false)
    }

    public override map<U>(fn: (value: T) => U): Result<U, never> {
      return new Result.Ok(fn(this.value))
    }

    public override fold<R>(ifOk: (value: T) => R, _ifErr: (error: never) => R): R {
      return ifOk(this.value)
    }

    public override getOrNull() {
      return this._value
    }

    public override errOrNull() {
      return null
    }

    public override getOrThrow() {
      return this._value
    }

    public override toString() {
      return `Ok(${this._value})`
    }
  }

  private static Err = class Err<E extends ResultErr> extends Result<never, E> {
    constructor(value: E) {
      super(value, false, true)
    }

    public override map<U>(fn: (value: never) => U): Result<U, E> {
      return this as unknown as Result<U, E>
    }

    public override fold<R>(_ifOk: (value: never) => R, ifErr: (error: E) => R): R {
      return ifErr(this.value)
    }

    public override getOrNull() {
      return null
    }

    public override errOrNull() {
      return this._value
    }

    public override getOrThrow(): never {
      throw this._value
    }

    public override toString() {
      return `Err(${this._value.message})`
    }
  }

  /**
   * Creates an `Ok` variant of the `Result`.
   * @template T The type of the successful value.
   * @param value The successful value to wrap in the `Ok` variant.
   * @returns A new `Result` instance representing a successful outcome.
   */
  public static ok<T>(value: T): Result<T, never> {
    return new this.Ok(value)
  }

  /**
   * Creates an `Err` variant of the `Result`.
   * @template E The type of the error, which must extend `ResultErr`.
   * @param value The error to wrap in the `Err` variant.
   * @returns A new `Result` instance representing a failure outcome.
   */
  public static err<E extends ResultErr>(value: E): Result<never, E> {
    return new this.Err(value)
  }
}