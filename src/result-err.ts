/**
 * Base class for all `ResultErr` types.
 * This class extends the built-in `Error` class and includes an abstract `_tag` property for identification.
 */
export abstract class ResultErr extends Error {
  /*** A `string` tag that identifies the specific type of error. */
  public readonly abstract _tag: string
}