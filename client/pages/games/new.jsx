import { Button } from "@mui/material";
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { config } from '../../components/Constants';
import Navbar from "../../components/Navbar";
import styles from '../../styles/game.module.css';
const back_url = config.url.BACKEND_URL

const Index = () => {
    const router = useRouter()

    const handleClick = e => {
        e.preventDefault()

        let userId = getCookie('uId');
        var url = back_url + 'field/new/' + userId;

        fetch(url)
            .then((serverPromise) =>
                serverPromise.json()
                    .then((field) => {

                        if (field) {
                            router.push('/games/' + field._id)
                        }
                    })
            )
    }

    return (
        <>
            <Navbar />
            <div className={styles.centerMax}>
                <p className={styles.headPar}>Создать игру</p>
                <Button onClick={handleClick}>Нажми меня</Button>
                <p className={styles.blank}></p>
            </div>
        </>

    )
}

export default Index
