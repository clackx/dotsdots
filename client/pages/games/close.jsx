import Navbar from "../../components/Navbar";
import styles from '../../styles/game.module.css'

const Index = () => {

    return (
        <>
            <Navbar />
            <div className={styles.centerMax}>
                <p className={styles.headPar}>Завершить игру</p>

                <p className={styles.infoPar}>После нажатия на кнопку, всё поле будет заполнено точками противника.</p>
                <p className={styles.infoPar}>Если ваши точки и острова не заземлены, вы можете проиграть.</p>
                <p className={styles.infoPar}>(пока не реализовано)</p>
            </div>
        </>
    )
}

export default Index
