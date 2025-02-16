import { z } from 'zod'
import { createSession, deleteSession } from '@/app/lib/session'

const loginSchema = z.object({
  email: z.string().email({ message: 'Formato de e-mail inválido' }).trim(),
  password: z
    .string()
    .min(6, { message: 'Senha precisa ter no mínimo 6 caracteres' })
    .trim(),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function login(prevState: any, formData: FormData) {
  try {
    const result = loginSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
      return {
        errors: result.error.flatten().fieldErrors,
      }
    }

    const { email, password } = result.data

    const response = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const { access_token: accessToken, refresh_token: refreshToken } =
      await response.json()

    await createSession(accessToken, refreshToken)
  } catch (err) {
    console.error(err)
  } finally {
    redirect('/dashboard')
  }
}

export async function logout() {
  await deleteSession()
  redirect('/signin')
}
