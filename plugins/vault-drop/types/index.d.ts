export type SecretRequest = { name: string; reason: string }

declare module 'claude-code' {
  interface PluginState {
    'vault-drop': { pending: SecretRequest | null; revealed: string[] }
  }
}
