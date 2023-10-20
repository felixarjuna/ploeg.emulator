import ReportIcon from "@mui/icons-material/Report";
import { ChipPropsColorOverrides, SvgIcon } from "@mui/material";
import { OverridableStringUnion } from "@mui/types";
import { IconType } from "react-icons";
import { BsCheck2All } from "react-icons/bs";
import { GiUnplugged } from "react-icons/gi";
import { MdPower, MdPowerOff } from "react-icons/md";

export const mainStatus = {
  connected: 1,
  connecting: 2,
  disconnected: 3,
  authorized: 4,
  error: 5,
  transaction: 6,
};

export const connectedStatuses = [
  mainStatus.connected,
  mainStatus.authorized,
  mainStatus.transaction,
];

export type Status = {
  status: number;
  text: string;
  color: OverridableStringUnion<
    "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning",
    ChipPropsColorOverrides
  >;
  icon: IconType | typeof SvgIcon;
};

export const pointStatus: { [key: string]: Status } = {
  connected: { status: mainStatus.connected, text: "Connected", color: "success", icon: MdPower },
  disconnected: {
    status: mainStatus.disconnected,
    text: "Disconnected",
    color: "secondary",
    icon: MdPowerOff,
  },
  connecting: {
    status: mainStatus.connecting,
    text: "Connecting",
    color: "info",
    icon: GiUnplugged,
  },
  error: { status: mainStatus.error, text: "Error", color: "error", icon: ReportIcon },
  authorized: {
    status: mainStatus.authorized,
    text: "Authorized",
    color: "success",
    icon: BsCheck2All,
  },
};
