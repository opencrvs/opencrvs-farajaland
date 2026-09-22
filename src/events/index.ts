import { adoptionEvent } from './adoption'
import { birthEvent } from './birth'
import { deathEvent } from './death'
import { divorceEvent } from './divorce'
import { marriageEvent } from './marriage'
import { nameChangeEvent } from './name-change'

export const eventConfigs = [
  birthEvent,
  deathEvent,
  marriageEvent,
  divorceEvent,
  adoptionEvent,
  nameChangeEvent
]
