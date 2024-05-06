import { Page } from '@playwright/test'
type Store = {
  getState: () => any
  dispatch: (action: any) => void
}

export function dispatchAction(page: Page, reduxAction: any) {
  return page.evaluate<Store>((reduxAction) => {
    const root = window.document.getElementById('root')!
    const container = Object.entries(root).find(([x]) =>
      x.includes('reactContainer')
    )![1]

    if (!container) {
      throw new Error('React container not found')
    }

    const store = container.memoizedState?.element?.props?.store

    if (!store) {
      throw new Error('Redux store not found')
    }

    store.dispatch(reduxAction)
    return store
  }, reduxAction)
}
