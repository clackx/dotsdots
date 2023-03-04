import Router from 'next/router'
import { useEffect } from "react";

const Index = () => {

  useEffect(() => {
    const { pathname } = Router
    if (pathname == '/') {
      Router.push('/games')
    }
  });
  
}

export default Index