import { EditorChange } from "codemirror";

export interface TerminalChange {
    value: string,
    change: EditorChange
}
