import * as React from 'react';
import ChatIcon from '@mui/icons-material/Chat';
import { IconButton, Box, Paper, Typography } from '@mui/material';

export default function Chat() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton
        onClick={open ? handleClose : handleClickOpen}
        sx={{
          position: 'fixed',
          bottom: 70,
          right: 50,
          zIndex: 9999,
          backgroundColor: 'primary.dark',
          color: 'white',
          boxShadow: 4,
          '&:hover': {
            backgroundColor: 'secondary.dark',
          },
        }}
      >
        <ChatIcon />
      </IconButton>

      {open && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: 130,
            right: 50,
            zIndex: 9998,
            width: 300,
            height: 400,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 3,
          }}
        >
          <Box>
            <Typography variant="h6">Chat</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              ...
            </Typography>
          </Box>
        </Paper>
      )}
    </>
  );
}
