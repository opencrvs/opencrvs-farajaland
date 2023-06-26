export const conditionals = {
    // This is an example how you can override the conditionals found from opencrvs-core
    iDType: {
      action: 'hide',
      expression: "!values.iDType || (values.iDType !== 'OTHER')"
    }
  }
  