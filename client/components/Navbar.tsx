import CasinoIcon from '@mui/icons-material/Casino';
import FitbitIcon from '@mui/icons-material/Fitbit';
import FlakyIcon from '@mui/icons-material/Flaky';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useRouter } from 'next/router';

import styles from '../styles/game.module.css';

const menuItems = [
  { text: 'Игры', href: '/games', icon: <CasinoIcon /> },
  { text: 'Настройки', href: '/users', icon: <SettingsSuggestIcon /> },
  { text: 'Правила', href: '/users/rules', icon: <LocalLibraryIcon /> }
]

const gameItems = [
  { text: 'Закончить игру', href: '/games/close', icon: <FlakyIcon /> },
  { text: 'Новая игра', href: '/games/new', icon: <FitbitIcon /> },
]


export default function TemporaryDrawer() {
  const [state, setState] = React.useState({
    left: false,
  });

  const router = useRouter();

  const toggleDrawer =
    (open: boolean) =>
      (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
          event.type === 'keydown' &&
          ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
          return;
        }

        setState({ left: open });
      };

  const list = () => (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {gameItems.map(({ text, href, icon }, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={() => router.push(href+'/')}>
              <ListItemIcon>
                {icon}
              </ListItemIcon>
              <div className={styles.menuDiv}>
                {/* <ListItemText primary={text} /> */}
                <p className={styles.regularPar}>{text}</p>
              </div>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {menuItems.map(({ text, href, icon }, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={() => router.push(href)}>
              <ListItemIcon>
                {icon}
              </ListItemIcon>
              <div className={styles.menuDiv}>
                {/* <ListItemText primary={text} /> */}
                <p className={styles.regularPar}>{text}</p>
              </div>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );


  interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
  }


  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
  })<AppBarProps>(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }));


  return (

    <AppBar position="fixed" open={true}>
      <Toolbar>
        <MenuIcon onClick={toggleDrawer(true)} cursor='pointer'/>
        <Button onClick={toggleDrawer(true)}>MENU</Button>
        <Drawer
          open={state['left']}
          onClose={toggleDrawer(false)}
        >
          {list()}
        </Drawer>
        <Typography variant="h6" noWrap component="div">
          <p className={styles.headPar}>Точки-точки</p>
        </Typography>
      </Toolbar>
    </AppBar>

  );
}
