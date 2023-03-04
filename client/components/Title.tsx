import { useContext, useEffect, useState } from 'react';
import { TGameObj, TStatsObj } from '../../server/dist/exp-types';
import styles from '../styles/Title.module.css';
import СlipboardButton from "./ClipboardButton";
import { SocketContext } from './SocketProvider';


const Title: React.FC<{ game: TGameObj }> = ({ game }) => {

    const { isSocketReady, socketData } =  useContext(SocketContext);
    const [title, setTitle] = useState<string>('');

    useEffect(() => {
        const timeout = setTimeout(() => {
            setTitle('Здесь что-то не так')
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);


    var result = <div className={styles.joinDiv}>
        <p className={styles.pOnePar}>{title}</p></div>


    if (!isSocketReady) { return result }


    if (socketData?.title) {

        if (socketData.title.shareLink) {
            result = <div className={styles.joinDiv}>
                <p className={styles.pOnePar}>
                    Пригласите игрока по ссылке</p>
                <СlipboardButton /></div>

        } else {

            var movediv = <div className={styles.moveDiv}>
                <p className={styles.move}>ХОД {socketData.title.moveIndex}</p></div>

            var yourPar = <p className={styles.specPar}>ВЫ наблюдатель</p>
            socketData.title.players[0] == game.userId &&
                (yourPar = <p className={styles.pOnePar}>ВЫ ЗЕЛЁНЫЙ (игрок1)</p>)
            socketData.title.players[1] == game.userId &&
                (yourPar = <p className={styles.pTwoPar}>ВЫ СИНИЙ (игрок2)</p>)
            var yourdiv = <div className={styles.yourDiv}>{yourPar}</div>

            var blankDiv = <div className={styles.blankDiv}></div>
            var leftDiv = blankDiv
            var rightDiv = blankDiv

            if (socketData.title.currentPlayer == 1) {
                leftDiv = <div className={styles.playerOneDiv}>
                    <p className={styles.playerMove}> ХОДИТ ЗЕЛЁНЫЙ </p></div>
            } else {
                rightDiv = <div className={styles.playerTwoDiv}>
                    <p className={styles.playerMove}> ХОДИТ СИНИЙ </p></div>
            }

            var spectactors = (socketData.subscribers < 3) ?
                "(нет наблюдателей)" : 'Наблюдателей: ' + `${socketData.subscribers - 2}`;
            var specdiv = <div className={styles.tr}>
                <p className={styles.specCount}>{spectactors}</p> </div>

            result = <div className={styles.mainDiv}>
                {yourdiv}
                <div className={styles.centerDiv}>
                    {leftDiv}{movediv}{rightDiv}
                </div>
                {specdiv}
            </div>
        }
    }

    return <div>{result}</div>;

}

export default Title;
