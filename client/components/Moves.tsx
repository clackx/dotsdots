import { useContext, useEffect, useRef } from 'react';
import styles from '../styles/Moves.module.css';
import { SocketContext } from './SocketProvider';

const Moves = () => {
  const { socketData } = useContext(SocketContext);

  const AlwaysScrollToBottom = () => {
    const elementRef = useRef<HTMLInputElement>(null);
    useEffect(() => elementRef.current?.scrollIntoView(
      { block: 'nearest', inline: 'start' }));
    return <div ref={elementRef} />;
  };

  const letters = [...Array(26)].map((_, i) =>
    String.fromCharCode(i + 'A'.charCodeAt(0)));
  var result = <div></div>


  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [divRef.current?.scrollHeight]);


  result = <div></div>

  if (socketData?.moves) {
    result =
      <div ref={divRef} className={styles.movesDiv}>
        {socketData.moves.map((element, index) => {
          var coord = `${letters[element.move[0]]}${element.move[1] + 1}`
          return (
            element.number == 1 ?
              <p key={index} className={styles.pOne}> {coord} </p> :
              <p key={index} className={styles.pTwo}> {coord} </p>
          );
        })}
        {/* <AlwaysScrollToBottom /> */}
      </div>
  }

  return (
    <div className={styles.mainDiv}>
      <h4 className={styles.myH4}>
        ХОДЫ</h4>{result}</div>
  );

}

export default Moves;
