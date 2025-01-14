import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from '@mui/material';
import { ShoppingCart, Store } from '@mui/icons-material';

export default function CreateCampaign() {
  const [activeTab, setActiveTab] = useState('product');
  const [biddingType, setBiddingType] = useState('');
  const [roasType, setRoasType] = useState('system');
  const [customRoas, setCustomRoas] = useState('');
  const [productLink, setProductLink] = useState('');
  const [keywords, setKeywords] = useState('');
  const [errors, setErrors] = useState({});
  const [adName, setAdName] = useState(''); // New state for ad name in Shop tab

  // Data objects for product and shop
  const [productData, setProductData] = useState({
    productLink: '',
    biddingType: '',
    roasType: 'system',
    customRoas: '',
    keywords: '',
  });

  const [shopData, setShopData] = useState({
    adName: '',
    biddingType: '',
    keywords: '',
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setBiddingType('');
    setErrors({});
  };

  // Validate product form
  const validateProduct = () => {
    let validationErrors = {};

    if (activeTab === 'product') {
      // Validate sản phẩm
      if (!productData.productLink.trim()) {
        validationErrors.productLink = 'Vui lòng nhập link sản phẩm.';
      }

      // Validate đặt giá thầu
      if (!productData.biddingType) {
        validationErrors.biddingType = 'Vui lòng chọn loại giá thầu.';
      }

      if (
        productData.biddingType === 'auto' &&
        productData.roasType === 'custom' &&
        !productData.customRoas
      ) {
        validationErrors.customRoas = 'Vui lòng nhập ROAS tùy chỉnh.';
      }

      if (
        productData.biddingType === 'manual' &&
        !productData.keywords.trim()
      ) {
        validationErrors.keywords = 'Vui lòng nhập danh sách từ khóa.';
      }
    }

    return validationErrors;
  };

  // Validate shop form
  const validateShop = () => {
    let validationErrors = {};

    if (activeTab === 'shop') {
      // Validate tên quảng cáo
      if (!shopData.adName.trim()) {
        validationErrors.adName = 'Vui lòng nhập tên quảng cáo.';
      }

      // Validate đặt giá thầu
      if (!shopData.biddingType) {
        validationErrors.biddingType = 'Vui lòng chọn loại giá thầu.';
      }

      // Validate giá thầu thủ công
      if (shopData.biddingType === 'manual' && !shopData.keywords.trim()) {
        validationErrors.keywords = 'Vui lòng nhập danh sách từ khóa.';
      }
    }

    return validationErrors;
  };

  const handleSubmit = () => {
    let validationErrors = {};

    if (activeTab === 'product') {
      validationErrors = validateProduct();
    } else if (activeTab === 'shop') {
      validationErrors = validateShop();
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // Show alert with data for both product and shop
      if (activeTab === 'product') alert(JSON.stringify(productData));
      else alert(JSON.stringify(productData));

      console.log({
        productData,
        shopData,
      });
      setErrors({});
    }
  };

  return (
    <Box>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="inherit"
        TabIndicatorProps={{ style: { backgroundColor: '#ee4d2d' } }}
      >
        <Tab
          icon={<ShoppingCart />}
          label="Sản phẩm"
          value="product"
          sx={{ color: activeTab === 'product' ? '#ee4d2d' : 'inherit' }}
        />
        <Tab
          icon={<Store />}
          label="Shop"
          value="shop"
          sx={{ color: activeTab === 'shop' ? '#ee4d2d' : 'inherit' }}
        />
      </Tabs>

      {/* Nội dung tab */}
      {activeTab === 'product' && (
        <Box sx={{ mt: 2 }}>
          {/* Section chọn sản phẩm */}
          <Typography variant="h6" gutterBottom>
            Chọn sản phẩm
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Nhập link sản phẩm"
            value={productData.productLink}
            onChange={(e) =>
              setProductData({ ...productData, productLink: e.target.value })
            }
            error={!!errors.productLink}
            helperText={errors.productLink}
            InputProps={{
              endAdornment: <ShoppingCart sx={{ color: '#ee4d2d' }} />,
            }}
          />

          {/* Section đặt giá thầu */}
          <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
            Đặt giá thầu
          </Typography>

          {/* Cards cho các tùy chọn */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Card: Giá thầu tự động */}
            <Card
              sx={{
                flex: 1,
                border:
                  productData.biddingType === 'auto'
                    ? `2px solid #ee4d2d`
                    : '1px solid #ccc',
                cursor: 'pointer',
              }}
              onClick={() =>
                setProductData({ ...productData, biddingType: 'auto' })
              }
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Giá thầu tự động
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tối đa doanh thu với ROAS hệ thống hoặc tùy chỉnh
                </Typography>
              </CardContent>
            </Card>

            {/* Card: Giá thầu thủ công */}
            <Card
              sx={{
                flex: 1,
                border:
                  productData.biddingType === 'manual'
                    ? `2px solid #ee4d2d`
                    : '1px solid #ccc',
                cursor: 'pointer',
              }}
              onClick={() =>
                setProductData({ ...productData, biddingType: 'manual' })
              }
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Giá thầu thủ công
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tự nhập danh sách từ khóa
                </Typography>
              </CardContent>
            </Card>
          </Box>
          {errors.biddingType && (
            <Typography color="error" sx={{ mt: 1 }}>
              {errors.biddingType}
            </Typography>
          )}

          {/* Hiển thị nội dung tương ứng với lựa chọn */}
          {productData.biddingType === 'auto' && (
            <Box sx={{ mt: 2 }}>
              <RadioGroup
                value={productData.roasType}
                onChange={(e) =>
                  setProductData({ ...productData, roasType: e.target.value })
                }
              >
                <FormControlLabel
                  value="system"
                  control={
                    <Radio
                      sx={{
                        color: '#ee4d2d',
                        '&.Mui-checked': { color: '#ee4d2d' },
                      }}
                    />
                  }
                  label="Tối đa doanh thu tối ưu ROAS hệ thống"
                />
                <FormControlLabel
                  value="custom"
                  control={
                    <Radio
                      sx={{
                        color: '#ee4d2d',
                        '&.Mui-checked': { color: '#ee4d2d' },
                      }}
                    />
                  }
                  label="Tối đa doanh thu tùy chỉnh ROAS"
                />
              </RadioGroup>
              {productData.roasType === 'custom' && (
                <TextField
                  type="number"
                  label="Nhập ROAS tùy chỉnh"
                  variant="outlined"
                  value={productData.customRoas}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      customRoas: e.target.value,
                    })
                  }
                  error={!!errors.customRoas}
                  helperText={errors.customRoas}
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          )}

          {productData.biddingType === 'manual' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Nhập danh sách từ khóa..."
              variant="outlined"
              value={productData.keywords}
              onChange={(e) =>
                setProductData({ ...productData, keywords: e.target.value })
              }
              error={!!errors.keywords}
              helperText={errors.keywords}
              sx={{ mt: 2 }}
            />
          )}
        </Box>
      )}

      {activeTab === 'shop' && (
        <Box sx={{ mt: 2 }}>
          {/* Section thiết lập cơ bản */}
          <Typography variant="h6" gutterBottom>
            Thiết lập cơ bản
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Nhập tên quảng cáo"
            value={shopData.adName}
            onChange={(e) =>
              setShopData({ ...shopData, adName: e.target.value })
            }
            error={!!errors.adName}
            helperText={errors.adName}
            sx={{ mb: 2 }}
          />

          <Typography variant="h6" gutterBottom>
            Đặt giá thầu
          </Typography>

          {/* Cards cho các tùy chọn */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Card: Giá thầu tự động */}
            <Card
              sx={{
                flex: 1,
                border:
                  shopData.biddingType === 'auto'
                    ? `2px solid #ee4d2d`
                    : '1px solid #ccc',
                cursor: 'pointer',
              }}
              onClick={() => setShopData({ ...shopData, biddingType: 'auto' })}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Giá thầu tự động
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tối đa doanh thu với ROAS hệ thống hoặc tùy chỉnh
                </Typography>
              </CardContent>
            </Card>

            {/* Card: Giá thầu thủ công */}
            <Card
              sx={{
                flex: 1,
                border:
                  shopData.biddingType === 'manual'
                    ? `2px solid #ee4d2d`
                    : '1px solid #ccc',
                cursor: 'pointer',
              }}
              onClick={() =>
                setShopData({ ...shopData, biddingType: 'manual' })
              }
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Giá thầu thủ công
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tự nhập danh sách từ khóa
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Hiển thị lỗi nếu có */}
          {errors.biddingType && (
            <Typography color="error" sx={{ mt: 1 }}>
              {errors.biddingType}
            </Typography>
          )}

          {shopData.biddingType === 'manual' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Nhập danh sách từ khóa..."
              variant="outlined"
              value={shopData.keywords}
              onChange={(e) =>
                setShopData({ ...shopData, keywords: e.target.value })
              }
              error={!!errors.keywords}
              helperText={errors.keywords}
              sx={{ mt: 2 }}
            />
          )}
        </Box>
      )}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#ee4d2d',
            '&:hover': {
              backgroundColor: '#d44126',
            },
          }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
}
