import './Popup.css';
import React, { useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Divider,
  Avatar,
  Box,
  TextField,
  Button,
} from '@mui/material';

const Popup = () => {
  const [startDate, setStartDate] = useState('2024-12-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  const handleSubmit = () => {
    chrome.runtime.sendMessage({
      type: 'EXPORT_REPORT',
      url: 'https://banhang.shopee.vn/',
      data: {
        startDate,
        endDate,
      },
    });

    // Reset fields after submission
    setStartDate('');
    setEndDate('');
  };

  return (
    <Card sx={{ width: '100%', minHeight: 700 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              alt="Company Logo"
              src="./icon-128.png"
              sx={{ width: 40, height: 40, marginRight: 1 }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', color: '#ee4d2d', marginRight: 1 }}
            >
              Nova
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: '#ee4d2d', fontWeight: 'bold' }}
            >
              Checking
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ marginY: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Popup;
