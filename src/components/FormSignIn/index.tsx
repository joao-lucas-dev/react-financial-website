import { useForm, SubmitHandler } from 'react-hook-form'
import Input from '../Input'
import Button from '../Button'
import useAuthentication from '../../hooks/useAutentication.ts'
import { useNavigate } from 'react-router-dom'

type FormData = {
  email: string
  password: string
}

export default function FormLogin() {
  const navigate = useNavigate()
  const { login } = useAuthentication()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit: SubmitHandler<FormData> = async ({ email, password }) => {
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        id="email"
        label="Seu e-mail"
        type="email"
        {...register('email', {
          required: 'Email é obrigatório',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Email inválido',
          },
        })}
      />
      {errors.email && (
        <span className="text-red-500 my-4 text-sm">
          {errors.email.message}
        </span>
      )}

      <Input
        id="password"
        label="Sua senha"
        type="password"
        {...register('password', {
          required: 'Senha é obrigatória',
          minLength: {
            value: 6,
            message: 'A senha deve ter pelo menos 6 caracteres',
          },
        })}
      />
      {errors.password && (
        <span className="text-red-500 my-4 text-sm">
          {errors.password.message}
        </span>
      )}

      <a href="/" className="hover:text-primary transition-all mt-2 text-sm">
        <span className="text-nam text-sm mt-2 block">Esqueci minha senha</span>
      </a>

      <Button title="Entrar" type="submit" />
    </form>
  )
}
