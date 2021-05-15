export class ThinlyError extends Error {
  constructor(
    public readonly responseBody: any,
    public readonly status: number = 500,
  ) {
    super()

    Object.setPrototypeOf(this, ThinlyError.prototype)
  }
}
