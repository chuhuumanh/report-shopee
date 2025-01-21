import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  FormHelperText,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextareaAutosize,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Chip,
  Paper,
  TableBody,
} from '@mui/material';
import { orange } from '@mui/material/colors';
import { styled } from '@mui/system';
import { excute, get, postFile } from '../../../request';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const OrangeButton = styled(Button)({
  backgroundColor: orange[500],
  color: '#fff',
  '&:hover': {
    backgroundColor: orange[700],
  },
});

export default function ReupLive(props) {
  const { cookies, apiKey } = props;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoType, setVideoType] = useState('Chính thức');
  const [productList, setProductList] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [video, setVideo] = useState(null);
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
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Handle clearing jobs from localStorage
  const handleClearJobs = () => {
    chrome.storage.local.set({ jobIds: [] }, () => {
      setJobs([]); // Clear the jobs in the component state
      alert('All jobs have been cleared');
    });
  };

  const handleFileUpload = async (file, setState) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await postFile('/uploads', formData);
      setState(response.path); // Assuming API response returns the file path
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  const handleSubmit = async () => {
    const validationErrors = {};
    if (!title) {
      validationErrors.title = 'Tiêu đề là bắt buộc';
    }
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const payload = {
        title,
        description,
        videoType,
        productList,
        coverImage,
        video,
      };

      const response = await excute({
        apiKey,
        cookies,
        feature: `reup_live`,
        data: payload,
      });

      const jobId = response.data.jobId;
      chrome.runtime.sendMessage({
        type: 'ADD_JOB',
        data: {
          jobId,
        },
      });

      try {
      } catch (error) {
        alert(`Tạo live thất bại vui lòng thử lại sau !`);
      }
    }
  };

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

  return (
    <Box p={1}>
      <Typography variant="h5" mb={2}>
        Tạo Live
      </Typography>

      <Stack spacing={3}>
        {/* Ảnh bìa */}
        <FormControl>
          <FormLabel>Ảnh bìa</FormLabel>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files[0], setCoverImage)}
          />
          {coverImage && (
            <Typography variant="body2" mt={1}>
              Đã upload: {coverImage}
            </Typography>
          )}
        </FormControl>

        {/* Video */}
        <FormControl>
          <FormLabel>Video</FormLabel>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileUpload(e.target.files[0], setVideo)}
          />
          {video && (
            <Typography variant="body2" mt={1}>
              Đã upload: {video}
            </Typography>
          )}
        </FormControl>

        {/* Tiêu đề */}
        <TextField
          label="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
        />

        {/* Mô tả */}
        <TextField
          label="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
        />

        {/* Loại video */}
        <FormControl>
          <FormLabel>Loại video</FormLabel>
          <RadioGroup
            row
            value={videoType}
            onChange={(e) => setVideoType(e.target.value)}
          >
            <FormControlLabel
              value="Chính thức"
              control={<Radio />}
              label="Chính thức"
            />
            <FormControlLabel
              value="Thử nghiệm"
              control={<Radio />}
              label="Thử nghiệm"
            />
          </RadioGroup>
        </FormControl>

        {/* Danh sách sản phẩm */}
        <FormControl>
          <FormLabel>Danh sách sản phẩm</FormLabel>
          <TextareaAutosize
            minRows={4}
            placeholder="Nhập danh sách sản phẩm"
            value={productList}
            onChange={(e) => setProductList(e.target.value)}
            style={{ width: '100%', padding: '8px', borderColor: '#ccc' }}
          />
        </FormControl>

        {/* Submit Button */}
        <OrangeButton variant="contained" onClick={handleSubmit}>
          Tạo Live
        </OrangeButton>
      </Stack>
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
                    <a href={job.url} rel="noopener noreferrer">
                      Open
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
