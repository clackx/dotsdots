import { useContext } from 'react';
import styles from '../styles/Stat.module.css';
import EmitButton from './EmitButton';
import { SocketContext } from './SocketProvider';

const Stat = () => {
  const { isSocketReady, socketData } = useContext(SocketContext);

  if (!isSocketReady) {
    return <div>
      <p className={styles.pTwoH}>ОШИБКА</p>
      <p className={styles.blank}></p>
      <p className={styles.pOne}>Проблема подключения</p>
    </div>
  }

  var result = <div></div>;


  if (socketData?.err) {
    result = <div>
      <p className={styles.pTwoH}>ОШИБКА</p>
      <p className={styles.blank}></p>
      <p className={styles.pOne}>Такой игры не существует</p>
      <p className={styles.blank}></p>
      <EmitButton event={'newGame'}>Создать новую</EmitButton>
    </div>
  }

  if (socketData?.arr1) {
    result = <div className={styles.mainDiv}>

      <div className={styles.playerOne}>
        <p className={styles.pOneH}>GREEN</p>

        <p className={styles.blank}></p>
        <p className={styles.pOne}>Острова: {socketData.arr1.areas}</p>
        <p className={styles.pOne}>Области: {socketData.arr1.paths}</p>
        <p className={styles.pOne}>Площадь: {socketData.arr1.square}</p>
        <p className={styles.blank}></p>
        <p className={styles.pOne}>Свободны: {socketData.arr1.free}</p>
        <p className={styles.pOne}>Заняты: {socketData.arr1.busy}</p>
        <p className={styles.pOne}>Закрыты: {socketData.arr1.closed}</p>
        <p className={styles.pOne}>Пойманы: {socketData.arr1.caught}</p>
        <p className={styles.blank}></p>
        <p className={styles.pOne}>Поймал: {socketData.arr2.caught}</p>
        <p className={styles.pOne}>Освободил: {socketData.arr1.uncaught}</p>
      </div>

      <div className={styles.playerTwo}>
        <p className={styles.pTwoH}>BLUE</p>
        <p className={styles.blank}></p>
        <p className={styles.pTwo}>Острова: {socketData.arr2.areas}</p>
        <p className={styles.pTwo}>Области: {socketData.arr2.paths}</p>
        <p className={styles.pTwo}>Площадь: {socketData.arr2.square}</p>
        <p className={styles.blank}></p>
        <p className={styles.pTwo}>Свободны: {socketData.arr2.free}</p>
        <p className={styles.pTwo}>Заняты: {socketData.arr2.busy}</p>
        <p className={styles.pTwo}>Закрыты: {socketData.arr2.closed}</p>
        <p className={styles.pTwo}>Пойманы: {socketData.arr2.caught}</p>
        <p className={styles.blank}></p>
        <p className={styles.pTwo}>Поймал: {socketData.arr1.caught}</p>
        <p className={styles.pTwo}>Освободил: {socketData.arr2.uncaught}</p>
      </div>
    </div>
  }


  return (
    result
  );

}

export default Stat;
