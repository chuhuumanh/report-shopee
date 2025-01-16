import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Autocomplete,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Stack,
  Grid,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { excute } from '../../../request';

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

  return null;
};

export default function UpdateCampaign(props) {
  const { cookies, apiKey } = props;
  const [campaignLink, setCampaignLink] = useState('');
  const [criteria, setCriteria] = useState(''); // Lưu giá trị cho dropdown COST/ACOS
  const [value, setValue] = useState(''); // Lưu giá trị cho input nhập
  const [selectedOperator, setSelectedOperator] = useState('');
  const [adjustmentOption, setAdjustmentOption] = useState(''); // Lưu giá trị cho radio button
  const [adjustmentCondition, setAdjustmentCondition] = useState(''); // Lưu điều kiện tăng giảm
  const [adjustmentValue, setAdjustmentValue] = useState(''); // Lưu giá trị điều chỉnh
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    const validationErrors = {};
    if (!campaignLink) {
      validationErrors.campaignLink = 'Vui lòng nhập link campaign';
    }

    if (campaignLink) {
      const dataParse = parseLink(campaignLink);
      if (!dataParse) {
        validationErrors.campaignLink = 'Vui lòng nhập link campaign';
      }
    }
    if (!value) {
      validationErrors.value = 'Vui lòng nhập giá trị';
    }
    if (!criteria) {
      validationErrors.criteria = 'Vui lòng chọn tiêu chí';
    }
    if (!selectedOperator) {
      validationErrors.operator = 'Vui lòng chọn điều kiện quét';
    }
    if (!adjustmentOption) {
      validationErrors.adjustmentOption =
        'Vui lòng chọn một tùy chọn điều chỉnh giá thầu';
    }
    if (
      ['money', 'percent'].includes(adjustmentOption) &&
      (!adjustmentCondition || !adjustmentValue)
    ) {
      validationErrors.adjustmentFields =
        'Vui lòng chọn điều kiện và nhập giá trị điều chỉnh';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      const dataParse = parseLink(campaignLink);

      const dataSend = {
        campaign_id: +dataParse.campaignId,
        query_keywords: {
          column: criteria === 'acos' ? 'broad_cir' : 'cost',
          value: +value,
          operator: selectedOperator,
        },
        change: {
          type: adjustmentOption,
          value: +adjustmentValue,
          adjustment: adjustmentCondition,
        },
      };

      try {
        await excute({
          apiKey,
          cookies,
          feature: `update_campaign`,
          data: dataSend,
        });

        alert('Lệnh thành công');
      } catch (error) {
        alert('Lệnh thất bại');
      }

      setErrors({});
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Link campaign
      </Typography>

      <Stack spacing={2}>
        {/* Campaign Link Input - Riêng 1 hàng */}
        <TextField
          label="Nhập link campaign"
          variant="outlined"
          fullWidth
          value={campaignLink}
          onChange={(e) => setCampaignLink(e.target.value)}
          error={!!errors.campaignLink}
          helperText={errors.campaignLink}
        />

        {/* Section: Quét Keywords theo Điều kiện */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quét Keywords theo Điều kiện
          </Typography>

          <Grid container spacing={2}>
            {/* Dropdown chọn COST / ACOS */}
            <Grid item xs={4}>
              <Autocomplete
                value={criteria}
                onChange={(event, newValue) => setCriteria(newValue)} // Chỉ cập nhật criteria khi chọn
                options={['ads', 'acos']}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Column"
                    variant="outlined"
                    fullWidth
                    error={!!errors.criteria}
                    helperText={errors.criteria}
                  />
                )}
              />
            </Grid>

            {/* Input nhập giá trị */}
            <Grid item xs={4}>
              <TextField
                label="Nhập giá trị"
                variant="outlined"
                type="number"
                fullWidth
                value={value}
                onChange={(e) => setValue(e.target.value)} // Chỉ cập nhật value khi nhập
                error={!!errors.value}
                helperText={errors.value}
              />
            </Grid>

            {/* Dropdown điều kiện Lớn hơn / Nhỏ hơn */}
            <Grid item xs={4}>
              <FormControl fullWidth error={!!errors.operator}>
                <InputLabel id="operator-label">Chọn điều kiện</InputLabel>
                <Select
                  labelId="operator-label"
                  value={selectedOperator}
                  label="Chọn điều kiện"
                  onChange={(e) => setSelectedOperator(e.target.value)}
                >
                  <MenuItem value="greater">Lớn hơn</MenuItem>
                  <MenuItem value="less">Nhỏ hơn</MenuItem>
                </Select>
                <FormHelperText>{errors.operator}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Section: Điều chỉnh giá thầu */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Điều chỉnh giá thầu
          </Typography>

          <Grid container spacing={2}>
            {/* Radio Button chọn tùy chọn điều chỉnh giá thầu */}
            <Grid item xs={12}>
              <FormControl
                component="fieldset"
                fullWidth
                error={!!errors.adjustmentOption}
              >
                <RadioGroup
                  row
                  value={adjustmentOption}
                  onChange={(e) => setAdjustmentOption(e.target.value)}
                >
                  <FormControlLabel
                    value="money"
                    control={<Radio />}
                    label="Xử lý giá thầu theo số tiền"
                  />
                  <FormControlLabel
                    value="percent"
                    control={<Radio />}
                    label="Xử lý giá thầu theo %"
                  />
                  <FormControlLabel
                    value="remove"
                    control={<Radio />}
                    label="Xóa keyword không có doanh thu"
                  />
                </RadioGroup>
                <FormHelperText>{errors.adjustmentOption}</FormHelperText>
              </FormControl>
            </Grid>

            {/* Chọn điều kiện Tăng / Giảm và Giá trị điều chỉnh */}
            {['money', 'percent'].includes(adjustmentOption) && (
              <>
                <Grid item xs={6}>
                  <FormControl fullWidth error={!!errors.adjustmentCondition}>
                    <InputLabel id="adjustment-condition-label">
                      Chọn điều kiện
                    </InputLabel>
                    <Select
                      labelId="adjustment-condition-label"
                      value={adjustmentCondition}
                      label="Chọn điều kiện"
                      onChange={(e) => setAdjustmentCondition(e.target.value)}
                    >
                      <MenuItem value="increase">Tăng</MenuItem>
                      <MenuItem value="decrease">Giảm</MenuItem>
                    </Select>
                    <FormHelperText>
                      {errors.adjustmentCondition}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                {/* Giá trị điều chỉnh */}
                <Grid item xs={6}>
                  <TextField
                    label="Giá trị điều chỉnh"
                    variant="outlined"
                    type="number"
                    fullWidth
                    value={adjustmentValue}
                    onChange={(e) => setAdjustmentValue(e.target.value)} // Chỉ cập nhật adjustmentValue khi nhập
                    error={!!errors.adjustmentFields}
                    helperText={errors.adjustmentFields}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>

        {/* Button Submit */}
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
    </Box>
  );
}
