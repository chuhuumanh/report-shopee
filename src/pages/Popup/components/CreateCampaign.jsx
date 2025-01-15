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
  TextareaAutosize,
} from '@mui/material';
import { ShoppingCart, Store } from '@mui/icons-material';
import { excute } from '../../../request';

export default function CreateCampaign(props) {
  const { cookies } = props;
  const [activeTab, setActiveTab] = useState('product');
  const [txt, setTxt] = useState('');
  const [errors, setErrors] = useState({});

  // Data objects for product and shop
  const [productData, setProductData] = useState({
    productLink: 'https://banhang.shopee.vn/portal/product/28222878273',
    bidding_strategy: '',
    roasType: 'system',
    roi_two_target: '',
    keywords: '',
  });

  const [shopData, setShopData] = useState({
    adName: '',
    bidding_strategy: '',
    keywords: '',
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setErrors({});
  };

  // Validate product form
  const validateProduct = () => {
    let validationErrors = {};

    if (activeTab === 'product') {
      // Validate sản phẩm
      if (!productData.productLink.trim()) {
        validationErrors.productLink = 'Vui lòng nhập link sản phẩm.';
      } else {
        const shopeeProductRegex =
          /https?:\/\/banhang\.shopee\.vn\/portal\/product\/(\d+)/;
        const match = productData.productLink.match(shopeeProductRegex);

        if (!match) {
          validationErrors.productLink = 'Link sản phẩm không hợp lệ.';
        } else {
          const productId = match[1];
          console.log('Extracted product ID:', productId);
        }
      }

      // Validate đặt giá thầu
      if (!productData.bidding_strategy) {
        validationErrors.bidding_strategy = 'Vui lòng chọn loại giá thầu.';
      }

      if (
        productData.bidding_strategy === 'roi_two' &&
        productData.roasType === 'custom' &&
        !productData.roi_two_target
      ) {
        validationErrors.roi_two_target = 'Vui lòng nhập ROAS tùy chỉnh.';
      }

      if (
        productData.bidding_strategy === 'manual' &&
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
      if (!shopData.bidding_strategy) {
        validationErrors.bidding_strategy = 'Vui lòng chọn loại giá thầu.';
      }

      // Validate giá thầu thủ công
      if (shopData.bidding_strategy === 'manual' && !shopData.keywords.trim()) {
        validationErrors.keywords = 'Vui lòng nhập danh sách từ khóa.';
      }
    }

    return validationErrors;
  };

  const getProductIdFromLink = (productLink) => {
    const shopeeProductRegex =
      /https?:\/\/banhang\.shopee\.vn\/portal\/product\/(\d+)/;
    const match = productLink.match(shopeeProductRegex);
    return match ? match[1] : null;
  };

  const convertToKeywordArray = (dataString) => {
    return dataString
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const [keyword, matchType, bidPrice] = line.split('|');
        return {
          keyword: keyword?.trim(),
          bid_price: parseFloat(bidPrice?.trim()) || 0,
          match_type: matchType?.trim(),
        };
      });
  };
  const handleSubmit = async () => {
    let validationErrors = {};

    if (activeTab === 'product') {
      validationErrors = validateProduct();
    } else if (activeTab === 'shop') {
      validationErrors = validateShop();
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      if (activeTab === 'product') {
        const isManual =
          productData.bidding_strategy === 'manual' ? true : false;
        const dataSend = {
          item_id: +getProductIdFromLink(productData.productLink),
          type: 'product',
          bidding_strategy: productData.bidding_strategy,
        };

        if (isManual) {
          const txtKeywords = productData.keywords;
          const arrKeywords = convertToKeywordArray(txtKeywords);
          dataSend.keywords = arrKeywords.filter(
            (item) => item.match_type !== 'discovery'
          );
          const daily_discover = arrKeywords.find(
            (item) => item.keyword === 'daily_discover'
          );
          const you_may_also_like = arrKeywords.find(
            (item) => item.keyword === 'you_may_also_like'
          );

          if (daily_discover || you_may_also_like) {
            const location = {};

            if (daily_discover) {
              location.daily_discover = {
                state: 'active',
                bid_price: daily_discover.bid_price,
              };
            }

            if (you_may_also_like) {
              location.you_may_also_like = {
                state: 'active',
                bid_price: you_may_also_like.bid_price,
              };
            }

            dataSend.display_location = location;
          }
        } else {
          dataSend.roi_two_target = +productData.roi_two_target || 0;
        }

        try {
          const response = await excute({
            cookies,
            feature: `create_campaign`,
            data: dataSend,
          });
          if (response.success) {
            const campaign_id = response.data.campaignId;
            const url =
              activeTab === 'product'
                ? `https://banhang.shopee.vn/portal/marketing/pas/product/manual/${campaign_id}`
                : `https://banhang.shopee.vn/portal/marketing/pas/shop/detail/${campaign_id}`;

            setTxt(url);
          }
        } catch (error) {
          alert(`Lỗi khi tạo campaign vui lòng kiểm tra lại link !`);
        }
      } else {
        const isManual = shopData.bidding_strategy === 'manual' ? true : false;
        const dataSend = {
          type: 'shop',
          bidding_strategy: shopData.bidding_strategy,
          name: shopData.adName,
        };

        if (isManual) {
          const arrKeywords = convertToKeywordArray(shopData.keywords);
          dataSend.keywords = arrKeywords;
        }

        try {
          const response = await excute({
            cookies,
            feature: `create_campaign`,
            data: dataSend,
          });
          if (response.success) {
            const campaign_id = response.data.campaignId;
            const url = `https://banhang.shopee.vn/portal/marketing/pas/shop/detail/${campaign_id}`;
            setTxt(url);
          }
        } catch (error) {
          alert(`Lỗi khi tạo campaign, vui lòng kiểm tra lại data`);
        }
      }
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
                  productData.bidding_strategy === 'roi_two'
                    ? `2px solid #ee4d2d`
                    : '1px solid #ccc',
                cursor: 'pointer',
              }}
              onClick={() =>
                setProductData({ ...productData, bidding_strategy: 'roi_two' })
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
                  productData.bidding_strategy === 'manual'
                    ? `2px solid #ee4d2d`
                    : '1px solid #ccc',
                cursor: 'pointer',
              }}
              onClick={() =>
                setProductData({ ...productData, bidding_strategy: 'manual' })
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
          {errors.bidding_strategy && (
            <Typography color="error" sx={{ mt: 1 }}>
              {errors.bidding_strategy}
            </Typography>
          )}

          {/* Hiển thị nội dung tương ứng với lựa chọn */}
          {productData.bidding_strategy === 'roi_two' && (
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
                  value="roi_two"
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
              {productData.roasType === 'roi_two' && (
                <TextField
                  type="number"
                  label="Nhập ROAS tùy chỉnh"
                  variant="outlined"
                  value={productData.roi_two_target}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      roi_two_target: e.target.value,
                    })
                  }
                  error={!!errors.roi_two_target}
                  helperText={errors.roi_two_target}
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          )}

          {productData.bidding_strategy === 'manual' && (
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
                  shopData.bidding_strategy === 'roi_two'
                    ? `2px solid #ee4d2d`
                    : '1px solid #ccc',
                cursor: 'pointer',
              }}
              onClick={() =>
                setShopData({ ...shopData, bidding_strategy: 'roi_two' })
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
                  shopData.bidding_strategy === 'manual'
                    ? `2px solid #ee4d2d`
                    : '1px solid #ccc',
                cursor: 'pointer',
              }}
              onClick={() =>
                setShopData({ ...shopData, bidding_strategy: 'manual' })
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
          {errors.bidding_strategy && (
            <Typography color="error" sx={{ mt: 1 }}>
              {errors.bidding_strategy}
            </Typography>
          )}

          {shopData.bidding_strategy === 'manual' && (
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
