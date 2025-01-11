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
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';
const BACKEND_URL = `http://localhost:1997`;
import { getData, updateData } from './firebase';
import ClearIcon from '@mui/icons-material/Clear';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const Popup = () => {
  const [startDate, setStartDate] = useState('2024-12-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [apiKey, setApiKey] = useState('');
  const [isKeyActive, setIsKeyActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jobData, setJobData] = useState([]);
  const [isFetchingJobs, setIsFetchingJobs] = useState(false);

  // Load API Key từ localStorage khi mở extension
  useEffect(() => {
    const storedKey = localStorage.getItem('apiKey');
    if (storedKey) {
      checkKeyOnGoogleSheets(storedKey, true);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setInterval(() => {
      chrome.storage.local.get(['jobIds'], (result) => {
        const jobIds = result.jobIds || [];
        if (jobIds.length) {
          fetchJobStatus(jobIds); // Gọi hàm để kiểm tra trạng thái của các jobIds
        }
      });
    }, 5000); // 1000ms = 1 giây
  }, []);

  const fetchJobStatus = async (jobIds) => {
    setIsFetchingJobs(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/job-status?jobIds=${jobIds.join(',')}`
      );
      const data = await response.json();
      setJobData(data);
    } catch (error) {
      console.error('Lỗi khi lấy job status:', error);
    } finally {
      setIsFetchingJobs(false);
    }
  };

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
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = fileUrl.split('/').pop();
      link.click();
    }
  };

  const handleRemoveJobs = () => {
    chrome.storage.local.remove(['jobIds'], () => {
      setJobData([]); // Đặt lại danh sách report (nếu bạn sử dụng state jobData)
    });
  };
  return (
    <Card sx={{ width: 800, minHeight: 700 }}>
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
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              Kích hoạt
            </Button>
          </Box>
        ) : (
          <Box>
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

            <Divider sx={{ marginY: 2 }} />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <Typography variant="h6" style={{ flex: 1 }}>
                Link report
              </Typography>
              <IconButton
                color="error"
                onClick={handleRemoveJobs}
                aria-label="Reset reports"
              >
                <RemoveCircleOutlineIcon />
              </IconButton>
            </div>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Id</TableCell>
                    <TableCell>Account</TableCell>
                    <TableCell>Date Export</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobData.map((job, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{job.account}</TableCell>
                      <TableCell>{job.dateReport}</TableCell>
                      <TableCell>{job.status}</TableCell>
                      <TableCell>{job.description}</TableCell>
                      <TableCell>
                        {job.fileUrl ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleDownload(job.fileUrl)}
                          >
                            Download
                          </Button>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Popup;
