import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  TextareaAutosize,
} from '@mui/material';
const { excute } = require('./../../../request');

// Hàm để kiểm tra và parse URL
const parseLink = (url) => {
  const regex =
    /https:\/\/banhang\.shopee\.vn\/portal\/marketing\/pas\/product\/manual\/(\d+)(?:\?from=(\d+))?(?:&to=(\d+))?(?:&group=custom)?/;
  const match = url.match(regex);

  if (match) {
    const campaignId = match[1];
    const from = match[2] || null;
    const to = match[3] || null;
    return { campaignId, from, to, type: 'product' };
  }

  const regexShop =
    /https:\/\/banhang\.shopee\.vn\/portal\/marketing\/pas\/shop\/detail\/(\d+)(?:\?from=(\d+))?(?:&to=(\d+))?(?:&group=custom)?/;
  const matchShop = url.match(regexShop);

  if (matchShop) {
    const campaignId = matchShop[1];
    const from = matchShop[2] || null;
    const to = matchShop[3] || null;
    return { campaignId, from, to, type: 'shop' };
  }

  return null;
};

export default function GetKeywords(props) {
  const { cookies, apiKey } = props;
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [txt, setTxt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLinkChange = (event) => {
    setLink(event.target.value);
  };

  useEffect(() => {
    // Get the current tab URL using chrome.tabs.query
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url;

      if (url) {
        const parsedLink = parseLink(url);
        setLink(url);
      }
    });
  }, []);

  const handleSubmit = async () => {
    const parsedData = parseLink(link);
    if (parsedData) {
      setData(parsedData);
      setError('');
      setLoading(true);

      try {
        const result = await excute({
          apiKey,
          cookies,
          feature: `get_keyword_by_campaign`,
          data: {
            campaignId: parsedData.campaignId,
            type: parsedData.type,
          },
        });
        let txtString = '';
        const data = result.data;
        for (const keyword of data.keywords) {
          txtString += `${keyword.keyword}|${keyword.match_type}|${
            keyword.bid_price / 1e5
          }\n`;
        }

        if (data.campaign) {
          const { daily_discover, you_may_also_like } = data.campaign;
          if (daily_discover) {
            txtString += `daily_discover|discovery|${daily_discover / 1e5}\n`;
          }

          if (you_may_also_like) {
            txtString += `you_may_also_like|discovery|${
              you_may_also_like / 1e5
            }`;
          }
        }

        setTxt(txtString);
      } catch (err) {
        console.log(err);
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
      {txt && (
        <Box>
          <Typography variant="body1" color="blue" sx={{ marginBottom: 2 }}>
            <strong>Content:</strong>
          </Typography>
          <TextareaAutosize
            minRows={4}
            value={txt}
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
