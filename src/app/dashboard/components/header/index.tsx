"use client"
// import { useRouter } from 'next/navigation'


import Link from 'next/link'
import styles from './styles.module.scss'
import Image from 'next/image'
import logoImg from '../../../../../public/box-icon.png'
// import { LogOutIcon } from 'lucide-react'
// import { deleteCookie } from 'cookies-next'
// import { toast } from 'sonner'

export function Header(){

  // const router = useRouter()

  // async function handleLogout(){
  //   deleteCookie('session', { path: '/'} )
  //   toast.success('Logout realizado com sucesso')
  //   router.replace('/')
  // }

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href='/dashboard'>
          <Image 
            alt='Logo Sujeito Pizza'
            src={logoImg}
            width={60}
            priority={true}
            quality={100}
          />
        </Link>
        <nav>
          <Link href='/dashboard/category'>
            Categoria
          </Link>
          <Link href='/dashboard/product'>
            Produto
          </Link>

          {/* <form action={handleLogout}> */}
          <form>
            <button type='submit'>
              {/* <LogOutIcon size={24} color='#FFF'/> */}
              Logout
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}