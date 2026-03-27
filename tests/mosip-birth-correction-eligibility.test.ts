import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { ActionType } from '@opencrvs/toolkit/events'
import { onBirthCorrectionActionHandler } from '../src/api/events/handler'

vi.mock('../src/api/notification/informantNotification', () => ({
  sendInformantNotification: vi.fn().mockResolvedValue(undefined)
}))

function createResponseToolkit() {
  return {
    response: vi.fn().mockReturnValue({
      code: vi.fn().mockReturnValue(undefined)
    })
  }
}

function createRequest(event: unknown) {
  return {
    auth: {
      artifacts: {
        token: 'test-token'
      }
    },
    payload: event
  }
}

describe('birth correction eligibility logging', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs when child.nid exists and child is under 16', async () => {
    const event = {
      id: 'event-id',
      actions: [
        {
          id: 'register-action',
          type: ActionType.REGISTER,
          status: 'Accepted',
          declaration: {
            'child.nid': '1234567890',
            'child.dob': '2015-01-01'
          }
        },
        {
          id: 'correction-request-action',
          type: ActionType.REQUEST_CORRECTION,
          status: 'Requested',
          declaration: {
            'child.name': {
              firstname: 'John',
              surname: 'Doe'
            }
          }
        }
      ]
    }

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const h = createResponseToolkit()

    await onBirthCorrectionActionHandler(createRequest(event) as any, h as any)

    expect(logSpy).toHaveBeenCalledWith(
      'Birth correction check passed: child.nid exists and child is under 16'
    )
  })

  it('does not log when child.nid is missing', async () => {
    const event = {
      id: 'event-id',
      actions: [
        {
          id: 'register-action',
          type: ActionType.REGISTER,
          status: 'Accepted',
          declaration: {
            'child.dob': '2015-01-01'
          }
        },
        {
          id: 'correction-request-action',
          type: ActionType.REQUEST_CORRECTION,
          status: 'Requested',
          declaration: {
            'child.name': {
              firstname: 'Jane',
              surname: 'Doe'
            }
          }
        }
      ]
    }

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const h = createResponseToolkit()

    await onBirthCorrectionActionHandler(createRequest(event) as any, h as any)

    expect(logSpy).not.toHaveBeenCalled()
  })
})
