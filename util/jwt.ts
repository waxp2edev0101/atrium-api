export const config = {
  algorithms: ['HS256' as const],
  expiresIn: process.env.EXPIREIN as string,
  secret: process.env.SECRET as string,
}
