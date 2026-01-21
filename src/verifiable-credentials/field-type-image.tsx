// eslint-disable-next-line no-undef
const React = globalThis.React

export function Input({ value }: { value: string }) {
  return React.createElement('img', { src: value })
}

export function Output({ value }: { value: string }) {
  return React.createElement('img', { src: value })
}
