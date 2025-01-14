import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  TextareaAutosize,
} from '@mui/material';

// Hàm để kiểm tra và parse URL
const parseLink = (url) => {
  const regex =
    /https:\/\/banhang\.shopee\.vn\/portal\/marketing\/pas\/product\/manual\/(\d+)(?:\?from=(\d+))?(?:&to=(\d+))?(?:&group=custom)?/;
  const match = url.match(regex);

  if (match) {
    const campaignId = match[1];
    const from = match[2] || null; // Nếu không có từ khóa from thì trả về null
    const to = match[3] || null; // Nếu không có từ khóa to thì trả về null
    return { campaignId, from, to };
  }

  return null;
};

// Giả lập việc gọi API để lấy keywords
const fakeApiCall = (campaignId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Giả lập trả về dữ liệu keyword
      resolve(
        `Keywords for Campaign ${campaignId}: keyword1, keyword2, keyword3`
      );
    }, 2000); // Giả lập 2 giây để trả về kết quả
  });
};

export default function GetKeywords(props) {
  const { cookies } = props;
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLinkChange = (event) => {
    setLink(event.target.value);
  };

  const handleSubmit = async () => {
    const parsedData = parseLink(link);
    if (parsedData) {
      setData(parsedData);
      setError('');
      setLoading(true);

      try {
        const result = await fakeApiCall(parsedData.campaignId);
        setKeywords(result); // Cập nhật kết quả keywords
      } catch (err) {
        setError('Không thể lấy dữ liệu keywords');
      } finally {
        setLoading(false); // Kết thúc quá trình loading
      }
    } else {
      setError('Link không hợp lệ, vui lòng kiểm tra lại.');
      setData(null);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Get keywords by link
      </Typography>

      {/* Input Link */}
      <TextField
        label="Nhập Link"
        value={link}
        onChange={handleLinkChange}
        fullWidth
        error={Boolean(error)} // Show error state if there's an error
        helperText={error} // Display error message
        sx={{ marginBottom: 2 }}
      />

      {/* Submit Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ marginBottom: 2, background: '#ee4d2d' }}
        disabled={loading} // Disable button while loading
      >
        {loading ? 'Loading...' : 'Submit'}
      </Button>

      {/* Display Keywords Textarea */}
      {keywords && (
        <Box>
          <Typography variant="body1" color="blue" sx={{ marginBottom: 2 }}>
            <strong>Keywords:</strong>
          </Typography>
          <TextareaAutosize
            minRows={4}
            value={keywords}
            readOnly
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              borderColor: '#ddd',
              borderRadius: '5px',
            }}
          />
        </Box>
      )}
    </Box>
  );
}
