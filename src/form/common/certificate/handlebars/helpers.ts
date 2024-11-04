import * as Handlebars from 'handlebars'
import { type IntlShape } from 'react-intl'

type FactoryProps = {
  intl: IntlShape
}
// An example helper showing how to access i18n properties
export function noop(props: FactoryProps): Handlebars.HelperDelegate {
  return function (this: any, value: string) {
    // eslint-disable-next-line no-console
    console.log(props)

    return value
  }
}

/** console.logs available handlebar variables with the handlebar: {{debug}} */
export function debug(): Handlebars.HelperDelegate {
  return function (this: any, value: string) {
    // eslint-disable-next-line no-console
    console.log(this)

    return value
  }
}

export function ordinalFormatDate(): Handlebars.HelperDelegate {
  return function (dateString: string) {
    console.log(dateString)
    const date = new Date(dateString.trim())
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return day + 'th'
      switch (day % 10) {
        case 1:
          return day + 'st'
        case 2:
          return day + 'nd'
        case 3:
          return day + 'rd'
        default:
          return day + 'th'
      }
    }

    // Format the date into ex: "11th November 2023"
    const day = getOrdinalSuffix(date.getDate())
    const month = date.toLocaleString('default', { month: 'long' })
    const year = date.getFullYear()

    const formattedDate = `${day} ${month} ${year}`
    return formattedDate
  }
}
