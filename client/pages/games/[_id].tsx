import { getCookie, setCookie } from 'cookies-next'
import { customAlphabet } from 'nanoid/non-secure'
import { useRouter } from 'next/router'
import { useEffect, useState } from "react"
import Canvas from "../../components/Canvas"
import Moves from "../../components/Moves"
import Navbar from "../../components/Navbar"
import EmitButton from "../../components/EmitButton"
import SocketProvider from "../../components/SocketProvider"
import Stats from "../../components/Stats"
import Title from "../../components/Title"
import RedirectPusher from "../../components/RedirectPusher"
import styles from '../../styles/game.module.css'



const Post = () => {
  const [gameId, setgameId] = useState('');

  // temporary, before user entity creation
  function getUserId(): string {
    let userId = getCookie('uId');
    if (!userId) {
      const nanoid = customAlphabet('abcdefghijkmnopqrstuvwxyz023456789', 8);
      userId = nanoid();
      setCookie('uId', userId);
    }
    return userId as string
  }

  const router = useRouter();
  const userId = getUserId();

  useEffect(() => {
    if (!router.isReady) return;
    setgameId(router.query?._id as string);
  }, [router.isReady, router.query?._id]);

  var result = <div></div>

  if (gameId) {
    result =
      <>
        <Navbar />
        <div className={styles.center}>
          <SocketProvider game={{ gameId, userId }}>
            <Title game={{ gameId, userId }} />
            <RedirectPusher />
            <div className={styles.columns}>
              <div className={styles.column_outer}><Stats /></div>
              <div className={styles.column_inner}><Canvas /></div>
              <div className={styles.column_outer_right}><Moves /></div>
            </div>

            <EmitButton event={'getField'} >🪄. :</EmitButton>
          </SocketProvider>
        </div>
      </>
  }

  return result;
}

export default Post
