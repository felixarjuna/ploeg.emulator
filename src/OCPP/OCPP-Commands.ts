import { ChargePointInfo, Command } from "../common/contracts";
import { OCPPDate, getId } from "../common/help-functions";
import { UrnOCPPCp220203BootNotificationRequest } from "./types/BootNotificationRequest";
import { UrnOCPPCp220203HeartbeatRequest } from "./types/HeartbeatRequest";
import { UrnOCPPCp220203StatusNotificationRequest } from "./types/StatusNotificationRequest";

export const createCommand = (
  command: string,
  metaData: any
): { ocppCommand: string; lastCommand: Command } => {
  const id = getId();
  let message;

  switch (command) {
    case "Heartbeat":
      const heartbeatRequest: UrnOCPPCp220203HeartbeatRequest = {};
      message = heartbeatRequest;
      break;
    case "BootNotification":
      const data = metaData.bootNotification as ChargePointInfo;
      const bootNotificationRequest: UrnOCPPCp220203BootNotificationRequest = {
        chargingStation: {
          model: data.chargePointModel,
          vendorName: data.chargePointVendor,
          serialNumber: data.chargePointSerialNumber,
          firmwareVersion: data.firmwareVersion,
        },
        reason: "PowerUp",
      };
      message = bootNotificationRequest;
      break;
    case "Authorize":
      message = { idTag: metaData.RFIDTag };
      break;
    case "StatusNotification":
      const statusNotificationRequest: UrnOCPPCp220203StatusNotificationRequest = {
        timestamp: OCPPDate(new Date()),
        connectorStatus: "Available",
        connectorId: metaData.connectorId,
        evseId: metaData.evseId,
      };
      message = statusNotificationRequest;
      break;
    case "StartTransaction":
      message = {
        connectorId: metaData.connectorId,
        idTag: metaData.idTag,
        meterStart: metaData.startMeterValue,
        timestamp: OCPPDate(new Date()),
        // reservationId: ''
      };
      break;
    case "StopTransaction":
      message = {
        idTag: metaData.idTag,
        meterStop: metaData.currentMeterValue,
        timestamp: OCPPDate(new Date()),
        transactionId: metaData.transactionId,
        reason: metaData.stopReason,
        // transactionData: ''
      };
      break;
    case "MeterValues":
      message = {
        connectorId: metaData.connectorId,
        transactionId: metaData.transactionId,
        meterValue: [
          {
            timestamp: OCPPDate(new Date()),
            sampledValue: [
              { measurand: "Voltage", phase: "L1", unit: "V", value: "222" },
              { measurand: "Voltage", phase: "L2", unit: "V", value: "223" },
              { measurand: "Voltage", phase: "L3", unit: "V", value: "223" },
              { measurand: "Current.Import", phase: "L1", unit: "A", value: "0" },
              { measurand: "Current.Import", phase: "L2", unit: "A", value: "0" },
              { measurand: "Current.Import", phase: "L3", unit: "A", value: "0" },
              {
                measurand: "Energy.Active.Import.Register",
                unit: "Wh",
                value: metaData.currentMeterValue.toString(),
              },
              { measurand: "Power.Active.Import", unit: "W", value: "3290" },
            ],
          },
        ],
      };
      break;
    case "DiagnosticsStatusNotification":
      message = { status: metaData.diagnosticStatus };
      break;
    case "FirmwareStatusNotification":
      message = { status: metaData.firmWareStatus };
      break;
    default:
      message = {};
      break;
  }

  return {
    ocppCommand: JSON.stringify([2, id, command, message]),
    lastCommand: { id, command, connector: metaData.connectorId },
  };
};
