import type { ClientModule } from 'claude-code'

// Runs on the drawing thread: keystrokes stay here. Shown in full while typing;
// the eye button (or Tab) masks it. The value leaves only on Enter, posted
// straight to the hooks module.
type State = { value: string; isHidden: boolean }

const MaskedField: ClientModule<{ name: string }, State> = ({ name }, surface) => {
  const { Box, Text, Button } = surface.elements
  const set = (patch: Partial<State>) =>
    surface.setState({ value: '', isHidden: false, ...surface.state, ...patch })
  const toggle = () => set({ isHidden: !surface.state?.isHidden })

  if (surface.state === undefined) {
    set({})
    surface.onKey(k => {
      const value = surface.state?.value ?? ''
      if (k.key === 'return') {
        if (value) surface.post({ type: 'submit', name, value })
      } else if (k.key === 'tab') {
        toggle()
      } else if (k.key === 'backspace' || k.key === 'delete') {
        set({ value: value.slice(0, -1) })
      } else if (k.ctrl && k.key === 'u') {
        set({ value: '' })
      } else if (!k.ctrl && !k.meta && [...k.key].length === 1) {
        set({ value: value + k.key })
      }
    })
  }

  const { value = '', isHidden = false } = surface.state ?? {}
  const length = [...value].length
  const shown = isHidden ? '•'.repeat(length) : value

  return (
    <Box borderStyle="round" paddingX={1} justifyContent="space-between" alignItems="center">
      {length ? (
        <Text>
          {shown.length > 48 ? `…${shown.slice(-47)}` : shown}
          <Text dimColor>▏</Text>
        </Text>
      ) : (
        <Text>
          <Text dimColor>▏</Text>
          <Text dimColor italic>Password</Text>
        </Text>
      )}
      <Box gap={1} alignItems="center">
        {length > 0 && <Text dimColor>{length}</Text>}
        <Button key="eye" label={isHidden ? '👁' : '🙈'} plain onPress={toggle} />
        <Text dimColor>↵ save</Text>
      </Box>
    </Box>
  )
}

export default MaskedField
