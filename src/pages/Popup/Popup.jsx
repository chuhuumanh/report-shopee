import './Popup.css';
import React, { useState, useEffect } from 'react';
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
import { getData, updateData } from './firebase';

const Popup = () => {
  const [startDate, setStartDate] = useState('2024-12-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [apiKey, setApiKey] = useState('');
  const [isKeyActive, setIsKeyActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load API Key từ localStorage khi mở extension
  useEffect(() => {
    // const storedKey = localStorage.getItem('apiKey');
    // if (storedKey) {
    //   checkKeyOnGoogleSheets(storedKey, true);
    // } else {
    //   setIsLoading(false);
    // }
    setApiKey('fudsfydsu');
    setIsKeyActive(true);
  }, []);

  const checkKeyOnGoogleSheets = async (key, isCheckExist) => {
    try {
      const listKeygen = await getData();
      setIsLoading(true);
      const keyCompare = listKeygen.find((item) => item?.key === key);

      if (!keyCompare) {
        alert('API Key không hợp lệ hoặc đã hết hạn!');
        setIsKeyActive(false);
        localStorage.removeItem('apiKey');
        return;
      }

      if (!isCheckExist) {
        if (keyCompare.count < 1) {
          alert('API Key không hợp lệ hoặc đã hết hạn!');
          setIsKeyActive(false);
          localStorage.removeItem('apiKey');
          return;
        }
      }

      if (!isCheckExist) {
        await updateData(keyCompare.index, {
          count: +keyCompare.count - 1,
        });
      }
      setApiKey(key);
      setIsKeyActive(true);
    } catch (error) {
      console.error('Lỗi khi kiểm tra API Key:', error);
      alert('Không thể kiểm tra API Key. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateKey = () => {
    if (apiKey.trim()) {
      checkKeyOnGoogleSheets(apiKey);
      localStorage.setItem('apiKey', apiKey);
    } else {
      alert('Vui lòng nhập API Key!');
    }
  };

  const handleSubmit = () => {
    if (!isKeyActive) {
      alert('API Key chưa được kích hoạt. Vui lòng nhập và kích hoạt API Key!');
      return;
    }

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

        {!isKeyActive ? (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Vui lòng nhập API Key để kích hoạt
            </Typography>
            <TextField
              label="Nhập API Key"
              fullWidth
              variant="outlined"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleActivateKey}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Kích hoạt
            </Button>
          </Box>
        ) : (
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Submit
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Popup;
