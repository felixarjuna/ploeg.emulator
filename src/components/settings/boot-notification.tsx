import HelpIcon from "@mui/icons-material/Help";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Divider, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useContext, useState } from "react";
import { saveSettings } from "../../common/help-functions";
import { helpBootNotification } from "../../common/help-texts";
import SettingsContext from "../../context/setting-context";

type HelpText = {
  [key: string]: string;
};

const BootNotification = () => {
  const { settingsState, setSettingsState } = useContext(SettingsContext);
  const [helpText, setHelpText] = useState<HelpText | null>(null);

  const changeValue = (field: any, value: any) =>
    setSettingsState({
      ...settingsState,
      bootNotification: { ...settingsState.bootNotification, [field]: value },
    });

  return (
    <Box>
      <Grid container spacing={5}>
        <Grid item xs={8}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Charge Point Model"
                required
                size="small"
                variant="outlined"
                name="chargePointModel"
                value={settingsState.bootNotification.chargePointModel}
                onChange={(e) => changeValue(e.target.name, e.target.value)}
                onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                  const element = e.target as HTMLInputElement;
                  setHelpText({ ...helpBootNotification[element.name], value: element.name });
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Charge Point Vendor"
                required
                size="small"
                variant="outlined"
                name="chargePointVendor"
                value={settingsState.bootNotification.chargePointVendor}
                onChange={(e) => changeValue(e.target.name, e.target.value)}
                onClick={(e) => {
                  const element = e.target as HTMLInputElement;
                  setHelpText({ ...helpBootNotification[element.name], value: element.name });
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Charge Point Serial Number"
                size="small"
                variant="outlined"
                name="chargePointSerialNumber"
                value={settingsState.bootNotification.chargePointSerialNumber}
                onChange={(e) => changeValue(e.target.name, e.target.value)}
                onClick={(e) => {
                  const element = e.target as HTMLInputElement;
                  setHelpText({ ...helpBootNotification[element.name], value: element.name });
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Charge Box Serial Number"
                size="small"
                variant="outlined"
                name="chargeBoxSerialNumber"
                value={settingsState.bootNotification.chargeBoxSerialNumber}
                onChange={(e) => changeValue(e.target.name, e.target.value)}
                onClick={(e) => {
                  const element = e.target as HTMLInputElement;
                  setHelpText({ ...helpBootNotification[element.name], value: element.name });
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="IMSI"
                size="small"
                variant="outlined"
                name="imsi"
                value={settingsState.bootNotification.imsi}
                onChange={(e) => changeValue(e.target.name, e.target.value)}
                onClick={(e) => {
                  const element = e.target as HTMLInputElement;
                  setHelpText({ ...helpBootNotification[element.name], value: element.name });
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="ICCID"
                size="small"
                variant="outlined"
                name="iccid"
                value={settingsState.bootNotification.iccid}
                onChange={(e) => changeValue(e.target.name, e.target.value)}
                onClick={(e) => {
                  const element = e.target as HTMLInputElement;
                  setHelpText({ ...helpBootNotification[element.name], value: element.name });
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Firmware Version"
                size="small"
                variant="outlined"
                name="firmwareVersion"
                value={settingsState.bootNotification.firmwareVersion}
                onChange={(e) => changeValue(e.target.name, e.target.value)}
                onClick={(e) => {
                  const element = e.target as HTMLInputElement;
                  setHelpText({ ...helpBootNotification[element.name], value: element.name });
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Meter Serial Number"
                size="small"
                variant="outlined"
                name="meterSerialNumber"
                value={settingsState.bootNotification.meterSerialNumber}
                onChange={(e) => changeValue(e.target.name, e.target.value)}
                onClick={(e) => {
                  const element = e.target as HTMLInputElement;
                  setHelpText({ ...helpBootNotification[element.name], value: element.name });
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                onClick={() => saveSettings(settingsState)}
              >
                Save
              </Button>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="meterType"
                size="small"
                variant="outlined"
                name="meterType"
                value={settingsState.bootNotification.meterType}
                onChange={(e) => changeValue(e.target.name, e.target.value)}
                onClick={(e) => {
                  const element = e.target as HTMLInputElement;
                  setHelpText({ ...helpBootNotification[element.name], value: element.name });
                }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4}>
          {helpText === null ? null : (
            <Paper sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography fontWeight="bold" color="primary">
                  {helpText.value}
                </Typography>
                <HelpIcon color="primary" />
              </Box>
              <Divider sx={{ mt: 0.5, mb: 1.5 }} />
              <Stack direction="row" spacing={2} sx={{ pb: 1 }}>
                <Box>
                  <Typography color="primary">Type:</Typography>
                </Box>
                <Box>{helpText.type}</Box>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Box>
                  <Typography color="primary">Desc:</Typography>
                </Box>
                <Box>{helpText.description}</Box>
              </Stack>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default BootNotification;
