import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/system';
import { orange } from '@mui/material/colors';
import { postFile, uploadVideoFile } from '../../../request';

const OrangeButton = styled(Button)({
  backgroundColor: orange[500],
  color: '#fff',
  '&:hover': {
    backgroundColor: orange[700],
  },
});

export default function ReupVideo({ cookies, apiKey }) {
  const [errors, setErrors] = useState([]);
  const [uploadResults, setUploadResults] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState([]);

  const parseFilename = (name) => {
    const match = name.match(/^(.+?)__([0-9,]+)__([\d\-T:]+)\.mp4$/i);
    if (!match) return {};
    const [, videoName, productIds, schedule] = match;
    return {
      videoName,
      productIds: productIds.split(','),
      schedule,
    };
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFilesToUpload(selectedFiles);
    setErrors([]);
  };

  const handleUploadAllFiles = async () => {
    const failedFiles = [];
    const results = [];
    const formData = new FormData();

    const jsonFiles = filesToUpload.filter((file) =>
      file.name.endsWith('.json')
    );
    const videoFiles = filesToUpload.filter((file) =>
      file.name.endsWith('.mp4')
    );

    if (jsonFiles.length !== 1) {
      setErrors(['⚠️ Phải chọn đúng 1 file .json để upload kèm.']);
      return;
    }

    for (let file of filesToUpload) {
      formData.append('files', file);
    }

    formData.append('cookies', cookies || '');
    formData.append('apiKey', apiKey || '');

    for (let file of videoFiles) {
      const { videoName, productIds, schedule } = parseFilename(file.name);
      results.push({
        file: file.name,
        videoName,
        productIds,
        schedule,
      });
    }

    if (results.length === 0) {
      failedFiles.push('⚠️ Không có file video .mp4 hợp lệ để upload.');
      setErrors(failedFiles);
      return;
    }

    try {
      await uploadVideoFile(formData);
      setUploadResults(results);
    } catch (err) {
      failedFiles.push('❌ Upload thất bại');
    }

    setErrors(failedFiles);
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>
        Upload nhiều video
      </Typography>

      <Stack spacing={3}>
        <FormControl>
          <FormLabel>
            Chọn các file video (.mp4) và 1 file cấu hình (.json)
          </FormLabel>
          <input
            type="file"
            accept=".mp4,.json"
            multiple
            onChange={handleFileChange}
          />
          {errors.length > 0 && (
            <FormHelperText error>
              {errors.map((err, idx) => (
                <div key={idx}>{err}</div>
              ))}
            </FormHelperText>
          )}
        </FormControl>

        {uploadResults.length > 0 && (
          <Box>
            <Typography variant="h6" mt={3}>
              Upload thành công, vui lòng truy cập vào{' '}
              <a
                href="https://banhang.shopee.vn/creator-center/video-upload/manage/posted"
                target="_blank"
                rel="noopener noreferrer"
              >
                link này
              </a>{' '}
              và kiểm tra sau 1 vài phút.
            </Typography>
          </Box>
        )}

        <OrangeButton variant="contained" onClick={handleUploadAllFiles}>
          Submit
        </OrangeButton>
      </Stack>
    </Box>
  );
}
