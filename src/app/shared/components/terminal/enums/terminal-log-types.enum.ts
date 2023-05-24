
export enum ETerminalLogTypes {
    'error' = 'error',
    'warn' = 'warn',
    'log' = 'log',
    'info' = 'info',
    'success' = 'success'
}

export const terminalLogTypes = Object.keys(ETerminalLogTypes);