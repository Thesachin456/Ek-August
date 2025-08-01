import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const SearchResults = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Search Messages
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography>
          Search functionality coming soon...
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default SearchResults;