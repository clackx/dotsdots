
import Navbar from "../../components/Navbar"
import { useEffect, useState } from "react"
import styles from '../../styles/game.module.css'

import { config } from '../../components/Constants'
const back_url = config.url.BACKEND_URL

const Index = () => {

  const [gameIds, setGameIds] = useState([])
  const [result, setResult] = useState(false)

  var api_url = back_url + 'field/sum';

  if (!result) {
    fetch(api_url)
      .then((serverPromise) =>
        serverPromise.json()
          .then((result) => {
            if (!result.error) {
              setGameIds(result)
            }
          })
      )
  }

  useEffect(() => {
    if (!gameIds) {
      setResult(<div>Loading...</div>)
    } else {
      setResult(
        <div>
          {gameIds.map((element, index) => {
            return (
              <p key={index} className={styles.regularPar}>
                {index + 1}. <a href={'/games/' + element._id}>{element._id}</a>
                &nbsp; Ходов: {element.moves.length}
                &nbsp; от {new Date(element.createdAt || '2023-01-01T21:00:00.007Z')
                  .toLocaleString()}
              </p>
            )
          })}
        </div>)
    }

  }, [gameIds])


  return (
    <>
      <Navbar />
      <div className={styles.centerMax}>
        <p className={styles.headPar}>Начатые игры</p>{result}
      </div>
    </>
  )
}

export default Index
