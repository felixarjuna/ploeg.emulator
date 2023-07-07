import { Clear, MonitorHeartOutlined, Speed } from "@mui/icons-material";
import {
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import moment from "moment";
import React from "react";
import { connectedStatuses, pointStatus } from "../../Config/charge-point-settings";
import SettingsContext from "../../Context/SettingsContext";
import { createCommand } from "../../OCPP/OCPP-Commands";
import { commands, connectors, logTypes, socketInfo } from "../../common/constants";
import { Command, ConnectorType } from "../../common/contracts";
import ChargePoint from "../ChargePoint/ChargePoint";
import Connector from "../Connector/Connector";

let heartbeatInterval: string | number | NodeJS.Timeout | undefined;
let meterValueInterval: { [key: number]: any } = {
  1: null,
  2: null,
};

let uploadInterval: string | number | NodeJS.Timeout | undefined;
let uploadSeconds: number;

const getTime = () => moment().format("HH:mm:ss");
const logArray: any[] | (() => any[]) = [];

const Main = () => {
  const { settingsState, setSettingsState } = React.useContext(SettingsContext);

  const [ws, setWs] = React.useState<WebSocket | null>(socketInfo.webSocket);
  const [logs, setLogs] = React.useState(logArray);
  const [status, setStatus] = React.useState(socketInfo.lastStatus || pointStatus.disconnected);
  const [conOne, setConOne] = React.useState<ConnectorType>(connectors[1]);
  const [conTwo, setConTwo] = React.useState<ConnectorType>(connectors[2]);

  const [uploading, setUploading] = React.useState(false);
  const [seconds, setSeconds] = React.useState(settingsState.simulation.diagnosticUploadTime);
  const [initialBootNotification, setInitialBootNotification] = React.useState(false);
  const [helpAnchorEl, setHelpAnchorEl] = React.useState<HTMLElement | null>();
  const [helpText, setHelpText] = React.useState("");

  const updateConnector: { [key: number]: React.Dispatch<React.SetStateAction<ConnectorType>> } = {
    1: setConOne,
    2: setConTwo,
  };

  const open = Boolean(helpAnchorEl);

  const logsEndRef = React.useRef<HTMLElement>(null);
  const scrollToBottom = () => logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  React.useEffect(() => scrollToBottom(), [logs]);

  const showHelpText = (event: React.MouseEvent, type: string) => {
    const getData = settingsState.stationSettings.filter((x) => x.key === type)[0];
    setHelpText(`${type} set to ${getData.value} seconds`);
    // setHelpAnchorEl(event.target);
  };

  const updateLog = (record: any) => {
    logArray.push(record);
    setLogs([...logArray]);
  };

  const clearLog = () => {
    logArray.length = 0;
    setLogs([]);
  };

  const uploadSimulate = () => {
    if (uploadSeconds === 0) {
      const result = createCommand("DiagnosticsStatusNotification", {
        diagnosticStatus: settingsState.simulation.diagnosticStatus,
      });
      centralSystemSend(result.ocppCommand, result.lastCommand);
      clearInterval(uploadInterval);
      setUploading(false);
      return;
    }
    uploadSeconds = uploadSeconds - 1;
    setSeconds(uploadSeconds);
  };

  const centralSystemSend = (command: string, localCommand: Command) => {
    ws?.send(command);
    commands.push(localCommand);
    updateLog({
      time: getTime(),
      type: logTypes.send,
      command: localCommand.command,
      message: command,
    });
  };

  const incomingMessage = (id: string, message: any) => {
    const getCommand = commands.filter((x) => x.id === id)[0];

    if (!getCommand) {
      updateLog({
        time: getTime(),
        type: logTypes.error,
        message: "Cannot recognize command!",
      });
      return;
    }

    const { command, connector } = getCommand;
    updateLog({
      time: getTime(),
      type: logTypes.message,
      command,
      message: JSON.stringify(message),
    });

    if (
      command === "BootNotification" &&
      !initialBootNotification &&
      message.status === "Accepted"
    ) {
      // B01 - Cold Boot Charging Station
      // Send connector(s) status(es)
      for (let i = 1; i <= settingsState.mainSettings.numberOfConnectors; i++) {
        const currentConnector = createCommand("StatusNotification", {
          connectorId: i,
          evseId: 1,
        });
        centralSystemSend(currentConnector.ocppCommand, currentConnector.lastCommand);
      }

      // Set initial boot to complete
      setInitialBootNotification(true);

      // Send first heartbeat
      const result = createCommand("Heartbeat", {});
      centralSystemSend(result.ocppCommand, result.lastCommand);

      // Set heartbeat interval
      const index = settingsState.stationSettings.findIndex((x) => x.key === "HeartbeatInterval");
      settingsState.stationSettings[index].value = message.interval;
      heartbeatInterval = setInterval(() => {
        const result = createCommand("Heartbeat", {});
        centralSystemSend(result.ocppCommand, result.lastCommand);
      }, +settingsState.stationSettings[index].value * 1000);
      return;
    }

    if (command === "Authorize" && message.idTagInfo.status === "Accepted") {
      setStatus(pointStatus.authorized);
      socketInfo.lastStatus = pointStatus.authorized;
    }

    if (command === "StartTransaction" && message.idTagInfo.status === "Accepted") {
      connectors[connector].transactionId = message.transactionId;
      connectors[connector].inTransaction = true;
      connectors[connector].status = "Occupied";
      updateConnector[connector]({ ...connectors[connector] });

      const index = settingsState.stationSettings.findIndex(
        (x) => x.key === "MeterValueSampleInterval"
      );

      meterValueInterval[connector] = setInterval(() => {
        connectors[connector].currentMeterValue = connectors[connector].currentMeterValue + 50;
        updateConnector[connector]({ ...connectors[connector] });

        const metaData = {
          connectorId: connectors[connector].connectorId,
          transactionId: connectors[connector].transactionId,
          currentMeterValue: connectors[connector].currentMeterValue,
        };

        const result = createCommand("MeterValues", metaData);
        centralSystemSend(result.ocppCommand, result.lastCommand);
      }, +settingsState.stationSettings[index].value * 1000);
    }

    if (command === "StopTransaction" && message.idTagInfo.status === "Accepted") {
      connectors[connector].startMeterValue = connectors[connector].currentMeterValue;
      connectors[connector].transactionId = 0;
      connectors[connector].inTransaction = false;
      connectors[connector].status = "Unavailable";
      updateConnector[connector]({ ...connectors[connector] });
      clearInterval(meterValueInterval[connector]);
      const statusData = createCommand("StatusNotification", {
        connectorId: connector,
        status: connectors[connector].status,
      });
      centralSystemSend(statusData.ocppCommand, statusData.lastCommand);
    }
  };

  const incomingRequest = (id: number, request: string, payload: any) => {
    const acceptRespond = JSON.stringify([3, id, { status: "Accepted" }]);
    const rejectRespond = JSON.stringify([3, id, { status: "Rejected" }]);
    updateLog({
      time: getTime(),
      type: logTypes.request,
      command: request,
      message: JSON.stringify(payload),
    });

    let connId = payload.connectorId;
    const metaData: any = {};

    switch (request) {
      case "RemoteStartTransaction":
        if (connectors[connId].inTransaction) {
          ws?.send(rejectRespond);
          return;
        }

        ws?.send(acceptRespond);
        connectors[connId].idTag = payload.idTag;
        updateConnector[connId]({ ...connectors[connId] });

        metaData.connectorId = connId;
        metaData.idTag = connectors[connId].idTag;
        metaData.startMeterValue = connectors[connId].startMeterValue;
        const newTransaction = createCommand("StartTransaction", metaData);
        centralSystemSend(newTransaction.ocppCommand, newTransaction.lastCommand);
        break;
      case "RemoteStopTransaction":
        connId = null;
        for (let i = 1; i <= settingsState.mainSettings.numberOfConnectors; i++) {
          if (connectors[i].transactionId === payload.transactionId) connId = i;
        }

        if (!connId) {
          ws?.send(rejectRespond);
          return;
        }

        ws?.send(acceptRespond);
        metaData.connectorId = connId;
        metaData.currentMeterValue = connectors[connId].currentMeterValue;
        metaData.transactionId = connectors[connId].transactionId;
        metaData.stopReason = connectors[connId].stopReason;
        const endTransaction = createCommand("StopTransaction", metaData);
        centralSystemSend(endTransaction.ocppCommand, endTransaction.lastCommand);
        break;
      case "TriggerMessage":
        const { requestedMessage } = payload;
        if (!connectors[connId].inTransaction && requestedMessage === "MeterValues") {
          ws?.send(rejectRespond);
          return;
        }

        ws?.send(acceptRespond);
        metaData.connectorId = connId;
        metaData.transactionId = connectors[connId].transactionId;
        metaData.currentMeterValue = connectors[connId].currentMeterValue;
        metaData.status = connectors[connId].status;
        metaData.bootNotification = settingsState.bootNotification;
        metaData.diagnosticStatus = uploading ? "Uploading" : "Idle";
        metaData.firmWareStatus = settingsState.simulation.firmWareStatus;
        const triggerMessage = createCommand(requestedMessage, metaData);
        centralSystemSend(triggerMessage.ocppCommand, triggerMessage.lastCommand);
        break;
      case "UnlockConnector":
        const getSetting = settingsState.stationSettings.findIndex(
          (x: any) => x.key === "UnlockConnectorOnEVSideDisconnect"
        );
        if (getSetting === -1 || settingsState.stationSettings[getSetting].value === "false") {
          ws?.send(JSON.stringify([3, id, { status: "NotSupported" }]));
          return;
        }

        ws?.send(
          JSON.stringify([
            3,
            id,
            {
              status:
                connId === 1
                  ? settingsState.simulation.connectorOneUnlock
                  : settingsState.simulation.connectorTwoUnlock,
            },
          ])
        );
        break;
      case "GetConfiguration":
        const returnConfiguration = {
          configurationKey: settingsState.stationSettings,
          unknownKey: [],
        };
        ws?.send(JSON.stringify([3, id, returnConfiguration]));
        break;
      case "ChangeConfiguration":
        const { key, value } = payload;
        let changeValueStatus = "Accepted";
        const findSetting = settingsState.stationSettings.findIndex(
          (x: { key: string; readonly: boolean; value: string }) => x.key === key
        );
        if (findSetting === -1) changeValueStatus = "NotSupported";

        const checkSetting = settingsState.stationSettings[findSetting];
        if (checkSetting.readonly) changeValueStatus = "Rejected";
        if (
          (checkSetting.value === "true" || checkSetting.value === "false") &&
          value !== "true" &&
          value !== "false"
        )
          changeValueStatus = "Rejected";
        if (!isNaN(+checkSetting.value) && isNaN(value)) changeValueStatus = "Rejected";

        ws?.send(JSON.stringify([3, id, { status: changeValueStatus }]));

        const element = { ...checkSetting, value };
        settingsState.stationSettings[findSetting] = element;
        setSettingsState({ ...settingsState });
        break;
      case "GetDiagnostics":
        ws?.send(
          JSON.stringify([3, id, { fileName: settingsState.simulation.diagnosticFileName }])
        );
        if (!uploading) {
          clearInterval(uploadInterval);
          setUploading(true);
          uploadSeconds = settingsState.simulation.diagnosticUploadTime;
          setSeconds(uploadSeconds);
          uploadInterval = setInterval(() => uploadSimulate(), 1000);
          const result = createCommand("DiagnosticsStatusNotification", {
            diagnosticStatus: "Uploading",
          });
          centralSystemSend(result.ocppCommand, result.lastCommand);
        }
        break;
      default:
        break;
    }
  };

  if (ws) {
    ws.onopen = () => {
      setStatus(pointStatus.connected);
      socketInfo.lastStatus = pointStatus.connected;
      updateLog({
        time: getTime(),
        type: logTypes.socket,
        message: "Charge point connected",
      });

      const initialBoot = createCommand("BootNotification", {
        bootNotification: settingsState.bootNotification,
      });
      centralSystemSend(initialBoot.ocppCommand, initialBoot.lastCommand);
    };

    ws.onclose = (event) => {
      let status = pointStatus.disconnected;
      if (event.code === 1006) {
        updateLog({
          time: getTime(),
          type: logTypes.error,
          message: "Connection problem",
        });
        status = pointStatus.error;
      } else {
        updateLog({
          time: getTime(),
          type: logTypes.socket,
          message: "Charge point disconnected",
        });
      }
      clearInterval(heartbeatInterval);
      clearInterval(meterValueInterval[1] ?? undefined);
      clearInterval(meterValueInterval[2] ?? undefined);
      setInitialBootNotification(false);
      setStatus(status);
      setUploading(false);
      clearInterval(uploadInterval);
      setWs(null);
    };

    ws.onmessage = (msg) => {
      const [type, id, message, payload] = JSON.parse(msg.data);
      switch (type) {
        case 2:
          incomingRequest(id, message, payload);
          break;
        case 3:
          incomingMessage(id, message);
          break;
        default:
          break;
      }
    };
  }

  return (
    <Container sx={{ maxWidth: "1366px !important" }}>
      <Grid container spacing={3}>
        <Grid item xs={3.2}>
          <ChargePoint
            ws={ws}
            setWs={setWs}
            status={status}
            setStatus={setStatus}
            centralSystemSend={centralSystemSend}
          />
          {uploading ? (
            <Paper sx={{ mt: 3, p: 2, height: "42.5px" }}>
              <Box display="flex" alignItems="center">
                <img src="./sand.png" alt="upload animation" height={36} />
                <Typography variant="body2" ml={1} color="primary">
                  SIMULATE UPLOAD DIAGNOSTICS FILE
                </Typography>
                <Typography variant="h5" ml={0.5} color="primary">
                  {seconds > 9 ? seconds : `0${seconds}`}
                </Typography>
                <Typography variant="body1" ml={0.5} color="primary">
                  sec.
                </Typography>
              </Box>
            </Paper>
          ) : null}
        </Grid>
        <Grid item xs={4.4}>
          {connectedStatuses.includes(status.status) ? (
            <Connector
              id={1}
              status={status}
              centralSystemSend={centralSystemSend}
              settings={conOne}
              setSettings={setConOne}
            />
          ) : null}
        </Grid>
        <Grid item xs={4.4}>
          {settingsState.mainSettings.numberOfConnectors === 2 &&
          connectedStatuses.includes(status.status) ? (
            <Connector
              id={2}
              status={status}
              centralSystemSend={centralSystemSend}
              settings={conTwo}
              setSettings={setConTwo}
            />
          ) : null}
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignContent="center">
              <Typography variant="h6" color="primary">
                LOG
              </Typography>
              <Box display="flex" justifyContent="flex-end" alignContent="center">
                <Speed
                  sx={{ ml: 1, cursor: "pointer" }}
                  color="primary"
                  onClick={(event) => showHelpText(event, "MeterValueSampleInterval")}
                />
                <MonitorHeartOutlined
                  sx={{ ml: 1, cursor: "pointer" }}
                  color="primary"
                  onClick={(event) => showHelpText(event, "HeartbeatInterval")}
                />
                <Tooltip title="Clear log" placement="top" arrow>
                  <Clear sx={{ ml: 1, cursor: "pointer" }} color="primary" onClick={clearLog} />
                </Tooltip>
              </Box>
            </Box>
            <Divider sx={{ mt: 0.5, mb: 1.5 }} />
            <Stack
              spacing={1}
              height={340}
              maxHeight={295}
              sx={{ overflowY: "scroll", fontSize: 14 }}
            >
              {logs.map((el, index) => (
                <Stack
                  key={index}
                  direction="row"
                  color={el.type.color}
                  spacing={2}
                  divider={<Divider orientation="vertical" flexItem />}
                >
                  <Box>{el.time}</Box>
                  <Box width={55} minWidth={55}>
                    {el.type.text}
                  </Box>
                  <Box width={175} minWidth={175}>
                    {el.command}
                  </Box>
                  <Box>{el.message}</Box>
                </Stack>
              ))}
              <Box ref={logsEndRef} />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Popover
        open={open}
        anchorEl={helpAnchorEl}
        onClose={() => setHelpAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Typography sx={{ p: 2, backgroundColor: "black", color: "white" }}>{helpText}</Typography>
      </Popover>
    </Container>
  );
};

export default Main;
