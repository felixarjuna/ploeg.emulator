# OCPP Charging Station simulator

This is a charging station simulator that supports OCPP JSON-2.0.1/1.6/1.5. This project extends the [OCPP-Charge-Point-Simulator](https://github.com/Lamerat/OCPP-Charge-Point-Simulator/tree/main/) project by Lamerat by adding OCPP JSON-2.0.1 support and implement Typescript. Shout out to the base project. 🚀

## Implemented functions

Below are the implemented functions that should be initiated by Charging Station and also by CSMS (Charging Station Management System).

### Operations Initiated by Charge Point

- Boot Notification
- Authorize
- Heartbeat
- Meter Values
- Start Transaction
- Stop Transaction
- Status Notification

### Operations Initiated by Central System

- Remote Start Transaction
- Remote Stop Transaction
- Unlock connector
- GetConfiguration
- ChangeConfiguration
- TriggerMessage
  - BootNotification
  - Heartbeat
  - MeterValues
  - StatusNotification
  - DiagnosticsStatusNotification
  - FirmwareStatusNotification
- GetDiagnostics
