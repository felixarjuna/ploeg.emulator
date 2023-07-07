import { nanoid } from "nanoid";
import { ConnectorStatusEnumType } from "../OCPP/types/StatusNotificationRequest";
import { ConnectorType } from "./contracts";

export const logTypes = {
  socket: { text: "SOCKET", color: "black" },
  message: { text: "RECEIVE", color: "#4caf50" },
  send: { text: "SEND", color: "#1976d2" },
  info: { text: "INFO", color: "#9c27b0" },
  error: { text: "ERROR", color: "red" },
  request: { text: "REQUEST", color: "#9c27b0" },
};

type ConnectorDataType = {
  [key: string]: {
    text: string;
    backgroundColor: string;
    color: string;
    status: ConnectorStatusEnumType;
  };
};
export const connectorData: ConnectorDataType = {
  Available: {
    text: "Available",
    backgroundColor: "#4caf50",
    color: "white",
    status: "Available",
  },
  Charging: {
    text: "Charging",
    backgroundColor: "#3f51b5",
    color: "white",
    status: "Occupied",
  },
  Reserved: {
    text: "Reserved",
    backgroundColor: "#ffc107",
    color: "black",
    status: "Reserved",
  },
  Unavailable: {
    text: "Unavailable",
    backgroundColor: "#f57c00",
    color: "white",
    status: "Unavailable",
  },
  Faulted: {
    text: "Faulted",
    backgroundColor: "red",
    color: "white",
    status: "Faulted",
  },
  SuspendedEV: {
    text: "Suspended EV",
    backgroundColor: "#9c27b0",
    color: "white",
    status: "Faulted",
  },
  SuspendedEVSE: {
    text: "Suspended EVSE",
    backgroundColor: "#9c27b0",
    color: "white",
    status: "Faulted",
  },
  Finishing: {
    text: "Finishing",
    backgroundColor: "#9c27b0",
    color: "white",
    status: "Unavailable",
  },
};

type CommandType = {
  command: string;
  connector: number;
  id: string;
};
export const commands: CommandType[] = [];

export const activeLog = [];

const connectorOne: ConnectorType = {
  connectorId: 1,
  startMeterValue: 0,
  currentMeterValue: 0,
  status: "Available",
  stopReason: "Remote",
  inTransaction: false,
  idTag: nanoid(20),
  transactionId: 0,
  simulateUnlockStatus: "Unlocked",
};

const connectorTwo: ConnectorType = {
  connectorId: 2,
  startMeterValue: 0,
  currentMeterValue: 0,
  status: "Available",
  stopReason: "Remote",
  inTransaction: false,
  idTag: nanoid(20),
  transactionId: 0,
  simulateUnlockStatus: "UnlockFailed",
};

export const connectors: { [key: number]: ConnectorType } = {
  1: connectorOne,
  2: connectorTwo,
};

export const socketInfo: { webSocket: WebSocket | null; lastStatus: any } = {
  webSocket: null,
  lastStatus: null,
};
