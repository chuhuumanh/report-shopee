import './Popup.css';
import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Divider,
  Avatar,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import axios from 'axios';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import GetKeywords from './components/GetKeywords';
import CreateCampaign from './components/CreateCampaign';
import UpdateCampaign from './components/UpdateCampaign';
import UpdateBatchCampaign from './components/UpdateBatchCampaign';
import CreateReportMoney from './components/CreateReportMoney';
const BACKEND_ENDPOINT = `http://localhost:1997`;

const sideBarIcons = {
  get_keyword_by_campaign: <QueryStatsIcon />,
  create_campaign: <CampaignIcon />,
  update_campaign: <TrackChangesIcon />,
  update_batch_campaign: <AdsClickIcon />,
  create_report_money: <PersonSearchIcon />,
};

const components = (slug, cookies) => {
  const listComponent = {
    get_keyword_by_campaign: <GetKeywords cookies={cookies} />,
    create_campaign: <CreateCampaign cookies={cookies} />,
    update_campaign: <UpdateCampaign cookies={cookies} />,
    update_batch_campaign: <UpdateBatchCampaign cookies={cookies} />,
    create_report_money: <CreateReportMoney cookies={cookies} />,
  };

  return listComponent[slug];
};

async function getCookiesShopee() {
  return new Promise((resolve, reject) => {
    let cookiesString = '';
    chrome.cookies.getAll({ domain: '.shopee.vn' }, (cookies) => {
      const listKeys = ['SPC_ST', 'SPC_SC_SESSION', 'SPC_CDS'];
      for (const cookie of cookies) {
        if (listKeys.includes(cookie.name)) {
          cookiesString += `${cookie.name}=${cookie.value};`;
        }
      }
      resolve(cookiesString);
    });
  });
}

const Popup = () => {
  const [features, setFeatures] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [key, setKey] = useState('CHUHUUMANH');
  const [cookies, setCookies] = useState(null);

  const fetchCookies = async () => {
    const cookies = await getCookiesShopee();
    setCookies(cookies);
  };

  useEffect(() => {
    fetchCookies();
  }, []);

  const fetchFeatures = async () => {
    if (key) {
      const resFeature = await axios.get(
        `${BACKEND_ENDPOINT}/features?key=${key}`
      );
      const data = resFeature.data;
      const firstData = data[0];

      if (firstData) {
        setFeatures(data);
        setActiveTab(firstData.slug);
      }
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [key]);

  return (
    <Card
      sx={{
        width: 800,
        minHeight: 900,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Tạo hiệu ứng bóng nhẹ
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#ffffff',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#ffffff',
            padding: 2,
          }}
        >
          <Avatar
            alt="Company Logo"
            src="./icon-128.png"
            sx={{ width: 40, height: 40, marginRight: 1 }}
          />
          <Typography
            variant="h5"
            sx={{ color: '#ee4d2d', fontWeight: 'bold' }}
          >
            Nova Tool Shopee
          </Typography>
        </Box>
        <Box>
          {!cookies && (
            <>
              <Box
                sx={{
                  backgroundColor: '#ee4d2d',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  padding: '8px 16px',
                }}
              >
                Bạn cần login ở shopee trước
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Main content */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 250,
            bgcolor: '#f0f4f7', // Màu nền nhẹ và thanh thoát
            borderRight: '1px solid #ddd',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Features List */}
          <List>
            {(features || []).map((feature) => (
              <ListItemButton
                key={feature.id}
                onClick={() => setActiveTab(feature.slug)}
                sx={{
                  bgcolor:
                    activeTab === feature.slug ? '#ee4d2d' : 'transparent',
                  color: activeTab === feature.slug ? '#ffffff' : '#333',
                  '&:hover': { bgcolor: '#ffb2b2' }, // Màu nền hover nhẹ nhàng
                  borderRadius: '10px',
                  margin: '2px 10px',
                  transition: 'all 0.3s ease', // Hiệu ứng chuyển màu mượt mà
                }}
              >
                <ListItemIcon
                  sx={{
                    color: activeTab === feature.slug ? '#ffffff' : '#ee4d2d',
                  }}
                >
                  {sideBarIcons[feature.slug]}
                </ListItemIcon>
                <ListItemText primary={feature.title} />
              </ListItemButton>
            ))}
          </List>

          {/* Footer */}
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#999' }}>
              © 2025 Nova Tool Shopee
            </Typography>
          </Box>
        </Box>

        {/* Content area */}
        <Box sx={{ flex: 1, p: 3 }}>
          {cookies && (
            <CardContent>{components(activeTab, cookies)}</CardContent>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default Popup;
