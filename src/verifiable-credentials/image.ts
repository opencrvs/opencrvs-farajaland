import React from 'react'

// eslint-disable-next-line no-console
console.log('React', React)

export function Input({ value }: { value: string }) {
  return React.createElement('img', { src: value })
}

export function Output({ value }: { value: string }) {
  return React.createElement('img', { src: value })
}
