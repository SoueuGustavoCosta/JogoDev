export interface ClipboardPort {
  copy(text: string): Promise<boolean>;
}
