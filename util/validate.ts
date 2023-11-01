import { NextFunction, Request, Response } from 'express'
import { ValidationChain, validationResult } from 'express-validator'

export const customValidate =
  (validations: ValidationChain[]) => async (req: Request, res: Response, next: NextFunction) => {
    for (let validation of validations) {
      const result = (await validation.run(req)) as any
      if (result.errors.length) break
    }

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    res.status(400).json({ errors: errors.array() })
  }
