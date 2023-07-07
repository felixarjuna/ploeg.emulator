import { FirmwareStatusEnumType } from "../OCPP/types/FirmwareStatusNotificationRequest";
import { UploadLogStatusEnumType } from "../OCPP/types/LogStatusNotificationRequest";
import { ConnectorStatusEnumType } from "../OCPP/types/StatusNotificationRequest";
import { ReasonEnumType } from "../OCPP/types/TransactionEventRequest";
import { UnlockStatusEnumType } from "../OCPP/types/UnlockConnectorResponse";

export type StationInfo = {
  key: string;
  readonly: boolean;
  value: string;
}[];

export type Command = {
  id: string;
  command: string;
  connector: number;
};

export type SimulationInfo = {
  diagnosticFileName: string;
  diagnosticUploadTime: number;
  diagnosticStatus: UploadLogStatusEnumType;
  firmWareStatus: FirmwareStatusEnumType;
  connectorOneUnlock: UnlockStatusEnumType;
  connectorTwoUnlock: UnlockStatusEnumType;
};

export type ConnectionInfo = {
  protocol: string;
  address: string;
  port: number;
  chargePointId: string;
  OCPPversion: string;
  RFIDTag: string;
  numberOfConnectors: number;
};

export type ChargePointInfo = {
  chargePointVendor: string;
  chargePointModel: string;
  chargePointSerialNumber: string;
  chargeBoxSerialNumber: string;
  firmwareVersion: string;
  iccid: string;
  imsi: string;
  meterType: string;
  meterSerialNumber: string;
};

export type ConnectorType = {
  connectorId: number;
  startMeterValue: number;
  currentMeterValue: number;
  status: ConnectorStatusEnumType;
  stopReason: ReasonEnumType;
  inTransaction: boolean;
  idTag: string;
  transactionId: number;
  simulateUnlockStatus: string;
};
