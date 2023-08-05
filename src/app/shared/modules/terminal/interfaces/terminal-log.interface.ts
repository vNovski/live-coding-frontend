import { ETerminalLogTypes } from "../enums/terminal-log-types.enum";

export type TerminalLogType = keyof typeof ETerminalLogTypes;
export interface ITerminalLog {
    type: TerminalLogType,
    data: any[]
}