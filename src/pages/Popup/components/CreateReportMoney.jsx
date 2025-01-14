import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  FormHelperText,
} from '@mui/material';

export default function CreateReportMoney() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
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
      alert('Dữ liệu hợp lệ: ' + JSON.stringify({ startDate, endDate }));
      setErrors({});
    }
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
    </Box>
  );
}
