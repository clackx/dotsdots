import { Button } from '@mui/material';
import { useContext } from 'react';
import { SocketContext } from './SocketProvider';

interface ButtonProps {
    event: string, 
    children?: React.ReactNode
  }

const EmitButton: React.FC<ButtonProps> = ({ event, children }) => {
    const { socket } = useContext(SocketContext);

    const handleClick = () => {
        if (socket) {
            socket.emit('msgToServer', { event })
        }
    }
    return <Button onClick={handleClick}>{children}</Button>
}

export default EmitButton
