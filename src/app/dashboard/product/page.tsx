import { getCookieServer } from '@/lib/cookieServer';
import styles from './styles.module.scss';
import { api } from '@/app/services/app';
import { ProductProps } from '@/lib/product.type';
import Image from 'next/image'; // Importa o componente Image

import Img from './minipudim.jpg';

export default async function Product() {
  async function getProducts(): Promise<ProductProps[] | []> {
    try {
      const token = await getCookieServer();

      const response = await api.get('/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data || [];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  const products = await getProducts();

  return (
    <div className={styles.cardContainer}>
      {products.length > 0 ? (
        products.map((product) => (
          <div key={product.id} className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <h3>{product.name}</h3>
              </div>
              {/* <div className={styles.cardBody}>
                <li>Descrição: {product.description}</li>
              </div> */}

              <div className={styles.cardFooter}>
                <button className={styles.btn}>
                  Detalhes
                </button>
                <button className={styles.btn}>
                  Editar
                </button>
                <button className={styles.btn}>
                  Excluir
                </button>
              </div>

            </div>
          </div>
        ))
      ) : (
        <p>Nenhum produto encontrado.</p>
      )}
    </div>
  );
}
