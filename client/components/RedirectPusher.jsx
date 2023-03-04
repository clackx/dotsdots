import { useContext, useEffect } from 'react';
import { SocketContext } from './SocketProvider';
import Router from 'next/router';

const RedirectPusher = () => {
    const { socketData } =  useContext(SocketContext);

    useEffect(() => {
        if (socketData?.title?.shareLink) {
            Router.push('/games/' + socketData?.title.shareLink);
        }
    }, [socketData?.title?.shareLink]);

  return null;
}

export default RedirectPusher
