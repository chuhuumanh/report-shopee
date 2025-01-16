import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { excute, get } from '../../../request';

export default function CreateReportMoney(props) {
  const { cookies, apiKey } = props;
  const [startDate, setStartDate] = useState('2024-11-11');
  const [endDate, setEndDate] = useState('2024-12-12');
  const [errors, setErrors] = useState({});
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      chrome.storage.local.get(['jobIds'], async (result) => {
        const jobIds = result.jobIds || [];
        if (jobIds.length) {
          const response = await get(
            `shopee/get-job-states?jobIds=${jobIds.toString()}`
          );
          setJobs(response.data);
        }
      });
    }, 2000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleSubmit = async () => {
    const validationErrors = {};
    if (!startDate) {
      validationErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }
    if (!endDate) {
      validationErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      validationErrors.dateRange = 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        const response = await excute({
          apiKey,
          cookies,
          feature: `create_report_money`,
          data: {
            startDate,
            endDate,
          },
        });

        const jobId = response.data.jobId;
        console.log({
          type: 'ADD_JOB',
          data: {
            jobId,
          },
        });
        chrome.runtime.sendMessage({
          type: 'ADD_JOB',
          data: {
            jobId,
          },
        });
      } catch (error) {
        console.log(error);
        alert('Xảy ra lỗi khi sử dụng tính năng này');
      }
      setErrors({});
    }
  };

  // Helper function to determine color for status
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle clearing jobs from localStorage
  const handleClearJobs = () => {
    chrome.storage.local.set({ jobIds: [] }, () => {
      setJobs([]); // Clear the jobs in the component state
      alert('All jobs have been cleared');
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Chọn ngày cần đối soát
      </Typography>

      <Stack spacing={2}>
        {/* Start Date */}
        <TextField
          label="Ngày bắt đầu"
          variant="outlined"
          type="date"
          fullWidth
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          error={!!errors.startDate}
          helperText={errors.startDate}
          InputLabelProps={{
            shrink: true,
          }}
        />

        {/* End Date */}
        <TextField
          label="Ngày kết thúc"
          variant="outlined"
          type="date"
          fullWidth
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          error={!!errors.endDate}
          helperText={errors.endDate}
          InputLabelProps={{
            shrink: true,
          }}
        />

        {/* Error for date range */}
        {errors.dateRange && (
          <FormHelperText error>{errors.dateRange}</FormHelperText>
        )}

        {/* Submit Button */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: '#ee4d2d',
            '&:hover': {
              backgroundColor: '#d44126',
            },
          }}
        >
          Submit
        </Button>
      </Stack>

      {/* Section Report */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 4,
        }}
      >
        <Typography variant="h6">Report</Typography>
        <IconButton
          onClick={handleClearJobs}
          sx={{
            backgroundColor: '#d44126',
            color: 'white',
            '&:hover': {
              backgroundColor: '#ee4d2d',
            },
          }}
        >
          <DeleteSweepIcon />
        </IconButton>
      </Box>

      {/* Table showing jobs */}
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>URL</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job, index) => (
              <TableRow key={index + 1}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{job.description}</TableCell>
                <TableCell>
                  <Chip
                    label={job.status}
                    color={getStatusColor(job.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {job.url ? (
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
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
  );
}
