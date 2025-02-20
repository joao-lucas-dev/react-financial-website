import FormSignIn from '../../components/FormSignIn'
import GoogleButton from '../../components/GoogleLoginButton'
import LogoIcon from '../../icons/LogoIcon'

export default function Login() {
  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-8">
        <LogoIcon />
      </div>
      <div className="container md:w-475 p-11 rounded-3xl bg-white">
        <div>
          <h1 className="text-center mb-11 text-2xl font-semibold text-name">
            Acesse sua conta
          </h1>

          <FormSignIn />

          <div className="w-full h-2 my-8 flex justify-between items-center">
            <div className="w-full h-px bg-zinc-400 rounded-full"></div>
            <span className="text-sm text-zinc-400 mx-1">ou</span>
            <div className="w-full h-px bg-zinc-400 rounded-full"></div>
          </div>

          <GoogleButton title="Entrar com o Google" />
        </div>
      </div>

      <div className="mt-4 flex items-center">
        <span className="text-sm text-zinc-500">Ainda não possui conta?</span>
        <a className="text-primary ml-1 text-sm hover:underline">
          Faça seu cadastro!
        </a>
      </div>
    </main>
  )
}
