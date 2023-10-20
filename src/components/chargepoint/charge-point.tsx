import { Box, Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import React, { useContext } from "react";

import { createCommand } from "../../OCPP/OCPP-Commands";
import { socketInfo } from "../../common/constants";
import { Command } from "../../common/contracts";
import { Status, connectedStatuses, pointStatus } from "../../config/charge-point-settings";
import SettingsContext from "../../context/setting-context";

type ChargePointProps = {
  ws: WebSocket | null;
  setWs: React.Dispatch<React.SetStateAction<WebSocket | null>>;
  status: Status;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  centralSystemSend: (command: string, localCommand: Command) => void;
};

const ChargePoint = ({ ws, setWs, status, setStatus, centralSystemSend }: ChargePointProps) => {
  const { settingsState } = useContext(SettingsContext);

  const startConnection = () => {
    const { protocol, address, port, chargePointId, OCPPversion } = settingsState.mainSettings;

    // setWs(new WebSocket(`${protocol}://${address}:${port}/${chargePointId}`, [ OCPPversion ]))
    socketInfo.webSocket = new WebSocket(`${protocol}://${address}:${port}/OCPP/${chargePointId}`, [
      OCPPversion,
    ]);
    setWs(socketInfo.webSocket);
    setStatus(pointStatus.connecting);
  };

  const sendRequest = (command: string) => {
    const metaData: { RFIDTag?: any; bootNotification?: any } = {};
    switch (command) {
      case "Authorize":
        metaData.RFIDTag = settingsState.mainSettings.RFIDTag;
        break;
      case "BootNotification":
        metaData.bootNotification = settingsState.bootNotification;
        break;
      default:
        break;
    }
    const result = createCommand(command, metaData);
    centralSystemSend(result.ocppCommand, result.lastCommand);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" color="primary">
          CHARGE POINT
        </Typography>
        <Chip
          size="small"
          icon={<status.icon size={18} style={{ paddingLeft: 6, paddingRight: 3 }} />}
          label={status.text.toUpperCase()}
          color={status.color}
        />
      </Box>
      <Divider sx={{ mt: 0.5, mb: 1.5 }} />
      <Stack spacing={2}>
        {connectedStatuses.includes(status.status) ? (
          <Button variant="contained" color="warning" onClick={() => ws?.close()} fullWidth>
            Disconnect
          </Button>
        ) : (
          <Button variant="contained" fullWidth onClick={startConnection}>
            Connect
          </Button>
        )}
        <Button
          disabled={!connectedStatuses.includes(status.status)}
          variant="contained"
          fullWidth
          onClick={() => sendRequest("Authorize")}
        >
          Authorize
        </Button>
        <Button
          disabled={!connectedStatuses.includes(status.status)}
          variant="contained"
          fullWidth
          onClick={() => sendRequest("BootNotification")}
        >
          Boot notification
        </Button>
        <Button
          disabled={!connectedStatuses.includes(status.status)}
          variant="contained"
          fullWidth
          onClick={() => sendRequest("Heartbeat")}
        >
          Heartbeat
        </Button>
      </Stack>
    </Paper>
  );
};

export default ChargePoint;
