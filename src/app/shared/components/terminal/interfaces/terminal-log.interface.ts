import { TerminalLogTypes } from "../enums/terminal-log-types.enum";

export type TerminalLogType = keyof typeof TerminalLogTypes;
export interface TerminalLog {
    type: TerminalLogType,
    data: any[]
}