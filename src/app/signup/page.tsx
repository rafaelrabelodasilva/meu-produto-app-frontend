import Link from 'next/link'
import styles from './page.module.scss'
import { api } from '../services/app'
import { redirect } from 'next/navigation'

export default function Signup() {


  async function handleRegister(formData: FormData) {
    "use server"

    const firstName = formData.get("firstName")
    const lastName = formData.get("lastName")
    const email = formData.get("email")
    const password = formData.get("password")

    if (firstName === "" || lastName === "" || email === "" || password === "") {
      console.log('Preencha os campos obrigatórios')
    }
    
    try {
      await api.post('/users', {
        firstName, lastName, email, password
      })
    } catch (error) {
      console.log(error)
    }

    redirect('/')

  }

  return (
    <div className={styles.background}>
    <div className={styles.loginContainer}>
      <h2>Cadastro</h2>
      <p>
        Gerencie facilmente os produtos que você tem em casa.
        Nunca mais esqueça os detalhes importantes!
      </p>
      <form action={handleRegister}>
      <input type="text" className={styles.inputField} name="firstName" placeholder="Primeiro nome" value="Maria" />
      <input type="text" className={styles.inputField} name="lastName" placeholder="Sobrenome" value="Silva" />
        <input type="email" className={styles.inputField} name="email" placeholder="E-mail" value="m@outlook.com"/>
        <input type="password" className={styles.inputField} name="password" placeholder="Senha" value="123456"/>
        <button className={styles.button}>Registrar</button>
      </form>
      <Link href={'/'} className={styles.link}>Já possui acesso? Faça login aqui</Link>
    </div>
  </div>
  )
}