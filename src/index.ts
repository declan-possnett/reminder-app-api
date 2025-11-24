import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import remindersRouter from '@/routes/reminders'
import authRouter from '@/routes/auth'
import { AppError } from '@/utils/errors'
import { errorResponse } from '@/utils/response'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use('/auth', authRouter) // TODO: use utils
app.use('/reminders', remindersRouter)

app.use((_req, res) => {
  return res.status(404).json({ error: 'Not Found' })
})

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(errorResponse(err.message))
  }

  console.error('Unhandled error:', err)
  return res.status(500).json(errorResponse('Internal Server Error'))
})

if (process.env.NODE_ENV === 'production') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

export const viteNodeApp = app
