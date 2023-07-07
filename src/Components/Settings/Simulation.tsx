import HelpIcon from "@mui/icons-material/Help";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useContext, useState } from "react";
import SettingsContext from "../../Context/SettingsContext";
import { saveSettings } from "../../common/help-functions";
import { SimulateInfo, helpFirmwareStatus, simulateInfo } from "../../common/help-texts";

const firmwareStatuses = Object.keys(helpFirmwareStatus);

type HelpText = {
  [key: string]: string | { [key: string]: string };
};

const Simulation = () => {
  const { settingsState, setSettingsState } = useContext(SettingsContext);
  const [helpText, setHelpText] = useState<HelpText | null>(null);

  const changeValue = (field: any, value: any) =>
    setSettingsState({
      ...settingsState,
      simulation: { ...settingsState.simulation, [field]: value },
    });

  const changeValueAndInfo = (field: keyof SimulateInfo, value: string) => {
    setSettingsState({
      ...settingsState,
      simulation: { ...settingsState.simulation, [field]: value },
    });
    setHelpText({
      ...simulateInfo[field],
      valueDescription: (simulateInfo[field]?.valueDescription as { [key: string]: string })[value],
      value: field,
    });
  };

  return (
    <Box>
      <Grid container spacing={5}>
        <Grid item xs={3}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Diagnostic file name"
              size="small"
              variant="outlined"
              name="diagnosticFileName"
              value={settingsState.simulation.diagnosticFileName}
              onChange={(e) => changeValue(e.target.name, e.target.value)}
              onClick={(e) => {
                const element = e.target as HTMLInputElement;
                const key = element.name as keyof SimulateInfo;
                setHelpText({ ...simulateInfo[key], value: element.name });
              }}
            />
            <TextField
              fullWidth
              label="Upload diagnostic file time"
              type="number"
              size="small"
              name="diagnosticUploadTime"
              value={settingsState.simulation.diagnosticUploadTime}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 0 }}
              onChange={(e) => changeValue(e.target.name, e.target.value)}
              onClick={(e) => {
                const element = e.target as HTMLInputElement;
                const key = element.name as keyof SimulateInfo;
                setHelpText({ ...simulateInfo[key], value: element.name });
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Diagnostic Status Notification final</InputLabel>
              <Select
                size="small"
                value={settingsState.simulation.diagnosticStatus}
                label="Diagnostic Status Notification final"
                name="diagnosticStatus"
                onChange={(e) =>
                  changeValueAndInfo(e.target.name as keyof SimulateInfo, e.target.value)
                }
                onMouseDown={() =>
                  setHelpText({
                    description: simulateInfo.diagnosticStatus?.description ?? "",
                    valueDescription:
                      simulateInfo.diagnosticStatus?.valueDescription[
                        settingsState.simulation.diagnosticStatus
                      ] ?? "",
                    value: "diagnosticStatus",
                  })
                }
              >
                <MenuItem value={"Uploaded"}>Uploaded</MenuItem>
                <MenuItem value={"UploadFailed"}>UploadFailed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Grid>
        <Grid item xs={3}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Firmware Status Notification final</InputLabel>
              <Select
                size="small"
                value={settingsState.simulation.firmWareStatus}
                label="Firmware Status Notification final"
                name="firmWareStatus"
                onChange={(e) =>
                  changeValueAndInfo(e.target.name as keyof SimulateInfo, e.target.value)
                }
                onMouseDown={() =>
                  setHelpText({
                    description: simulateInfo.firmWareStatus?.description ?? "",
                    valueDescription:
                      simulateInfo.firmWareStatus?.valueDescription[
                        settingsState.simulation.firmWareStatus
                      ] ?? "",
                    value: "firmWareStatus",
                  })
                }
              >
                {firmwareStatuses.map((x) => (
                  <MenuItem key={x} value={x}>
                    {x}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Connector 1 Unlock connector status</InputLabel>
              <Select
                size="small"
                value={settingsState.simulation.connectorOneUnlock}
                label="Connector 1 Unlock connector status"
                name="connectorOneUnlock"
                onChange={(e) =>
                  changeValueAndInfo(e.target.name as keyof SimulateInfo, e.target.value)
                }
                onMouseDown={() =>
                  setHelpText({
                    description: simulateInfo.connectorOneUnlock?.description ?? "",
                    valueDescription:
                      simulateInfo.connectorOneUnlock?.valueDescription[
                        settingsState.simulation.connectorOneUnlock
                      ] ?? "",
                    value: "connectorOneUnlock",
                  })
                }
              >
                <MenuItem value={"Unlocked"}>Unlocked</MenuItem>
                <MenuItem value={"UnlockFailed"}>UnlockFailed</MenuItem>
              </Select>
            </FormControl>
            {settingsState.mainSettings.numberOfConnectors === 2 ? (
              <FormControl fullWidth>
                <InputLabel>Connector 2 Unlock connector status</InputLabel>
                <Select
                  size="small"
                  value={settingsState.simulation.connectorTwoUnlock}
                  label="Connector 2 Unlock connector status"
                  name="connectorTwoUnlock"
                  onChange={(e) =>
                    changeValueAndInfo(e.target.name as keyof SimulateInfo, e.target.value)
                  }
                  onMouseDown={() =>
                    setHelpText({
                      description: simulateInfo.connectorTwoUnlock?.description ?? "",
                      valueDescription:
                        simulateInfo.connectorTwoUnlock?.valueDescription[
                          settingsState.simulation.connectorTwoUnlock
                        ] ?? "",
                      value: "connectorTwoUnlock",
                    })
                  }
                >
                  <MenuItem value={"Unlocked"}>Unlocked</MenuItem>
                  <MenuItem value={"UnlockFailed"}>UnlockFailed</MenuItem>
                </Select>
              </FormControl>
            ) : null}
          </Stack>
        </Grid>
        <Grid item xs={6}>
          {helpText === null ? null : (
            <Paper sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography fontWeight="bold" color="primary">
                  {helpText.value.toString()}
                </Typography>
                <HelpIcon color="primary" />
              </Box>
              <Divider sx={{ mt: 0.5, mb: 1.5 }} />
              <Stack direction="row" spacing={2} sx={{ pb: 1 }}>
                <Box sx={{ minWidth: 80 }}>
                  <Typography color="primary">Field desc:</Typography>
                </Box>
                <Box>{helpText.description.toString()}</Box>
              </Stack>
              <Stack direction="row" spacing={2}>
                {helpText.valueDescription ? (
                  <>
                    <Box sx={{ minWidth: 80 }}>
                      <Typography color="primary">Value desc:</Typography>
                    </Box>
                    <Box>{helpText.valueDescription.toString()}</Box>
                  </>
                ) : null}
              </Stack>
            </Paper>
          )}
        </Grid>
      </Grid>
      <Button
        sx={{ mt: 3 }}
        startIcon={<SaveIcon />}
        variant="contained"
        onClick={() => saveSettings(settingsState)}
      >
        Save
      </Button>
    </Box>
  );
};

export default Simulation;
