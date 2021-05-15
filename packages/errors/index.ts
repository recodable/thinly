export class ThinlyError extends Error {
  constructor(
    public readonly message: string = '',
    public readonly status: number = 500,
  ) {
    super(message)

    Object.setPrototypeOf(this, ThinlyError.prototype)
  }
}
