
import Navbar from "../../components/Navbar";
import styles from '../../styles/game.module.css'


const Index = () => {

  return (
    <>
      <Navbar />
      <div className={styles.centerMax}>
        <p className={styles.headPar}>Пользователь</p>
        <p className={styles.regularPar}>настройки</p>
      </div>
    </>
  )
}

export default Index
