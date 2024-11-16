"use client"
//Quando utilizamos usecontent precisa ser use-client
//Porque é renderizado do lado do cliente
import { createContext, ReactNode, useState } from 'react'

import { getCookieClient } from '@/lib/cookieClient'
import { api } from '../services/app';

interface OrderItemProps{
  
}

type OrderContextData = {
  isOpen: boolean;
  onRequestOpen: (order_id: string) => Promise<void>; //Função que não retorna nada
  onRequestClose: () => void; //Função que não retorna nada
  order: OrderItemProps[];
}

type OrderProviderProps = {
  children: ReactNode;
}

export const OrderContext = createContext({} as OrderContextData)

export function OrderProvider({ children }: OrderProviderProps){
  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState<OrderItemProps[]>([])

  async function onRequestOpen(order_id: string){
    // console.log(order_id);

    const token = getCookieClient();

    const response = await api.get("/order/detail", {
      headers:{
        Authorization: `Bearer ${token}`
      },
      params:{
        order_id: order_id
      }
    })

    setOrder(response.data);
    setIsOpen(true);

  }

  function onRequestClose(){
    setIsOpen(false);
  }

  return(
    <OrderContext.Provider 
      value={{ 
        isOpen,
        onRequestOpen,
        onRequestClose,
        order
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}


