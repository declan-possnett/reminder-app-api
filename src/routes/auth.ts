import { Router } from 'express'
import { generateToken, hashPassword, comparePassword } from '@/utils/auth'

const router = Router()

const users: { [email: string]: { password: string } } = {}

router.post('/register', async (req, res) => {
  const { email, password } = req.body
  if (users[email]) {
    return res.status(400).json({ error: 'User already exists' })
  }
  const hashed = await hashPassword(password)
  users[email] = { password: hashed }
  return res.json({ message: 'User registered' })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = users[email]
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }
  const match = await comparePassword(password, user.password)
  if (!match) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }
  const token = generateToken({ email })
  return res.json({ token })
})

export default router
