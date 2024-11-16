import styles from "./page.module.scss";
import Link from "next/link";
import { api } from "./services/app";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function Home() {

  async function handleLogin(formData: FormData) {
    "use server"

    const email = formData.get("email")
    const password = formData.get("password")

    if (email === "" || password === "") {
      console.log('Preencha todos os campos obrigatórios.')
    }

    try {
      const response = await api.post('/session', {
        email, password
      })

      if(!response.data.token){
        console.log('Sem token bebe')
        return
      }

      const expressTime = 60 * 60 * 24 * 30 * 1000
      cookies().set('session', response.data.token, {
        maxAge: expressTime,
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === "production"
      })
    } catch (error) {
      console.log(error)
      return
    }
    redirect('/dashboard')
  }

  return (
    <div className={styles.background}>
      <div className={styles.loginContainer}>
        <h2>Login</h2>
        <p>
          Gerencie facilmente os produtos que você tem em casa.
          Nunca mais esqueça os detalhes importantes!
        </p>
        <form action={handleLogin}>
          <input type="email" className={styles.inputField} name="email" placeholder="E-mail" value="m@outlook.com"/>
          <input type="password" className={styles.inputField} name="password" placeholder="Senha" value="123456"/>
          <button className={styles.button} type="submit">Login</button>
        </form>
        <Link href={'/signup'} className={styles.link}>Registrar-se</Link>
      </div>
    </div>
  );
}