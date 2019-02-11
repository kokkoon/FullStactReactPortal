// compute field value based on value of other fields
export function computeValueByFormula (properties, formData) {
  let newFormData = {...formData}
  console.log('newFormData CVBF = ', newFormData)
  console.log('properties CVBF = ', properties)

  Object.keys(properties).forEach(key => {
    if (properties[key].formula) {
      const formula = properties[key].formula
      
      let operands = formula.replace(/\+|-|\*|\//g, ' ').split(' ')
      operands = operands.map(operand => formData[operand])
      console.log('operands = ', operands)

      if (properties[key].type === 'number') {
        const operators = formula.replace(/\w/g, '').split('')
        const updatedFormula = operands.map(operand => operators.length > 0 ? operand + operators.shift() : operand).join('')
        newFormData[key] = mathCalculation(updatedFormula)
        console.log('formula calculation = ', newFormData[key])
      }
      else if (properties[key].type === 'string'){
        newFormData[key] = operands.join(' ')
      }
    }
    else if (properties[key].type === 'array') {
      if (formData[key] !== undefined) {
        newFormData[key].forEach((item, childKey) => {
  console.log('newFormChildData CVBF = ', formData[key][childKey])
  console.log('newFormChildData CVBF = ', newFormData[key][childKey])
  // debugger
          const temp = computeValueByFormula(properties[key].items.properties, formData[key][childKey])
          newFormData[key][childKey] = temp
        })
        // newFormData[key] = newFormData[key].map((item, childKey) => 
        //   computeValueByFormula(properties[key].items.properties, newFormData[key][childKey])
        // )
      }
    }
  })

  return newFormData
}

// lookup value based on value of other field
export function lookUpValue (properties, formData, parentFieldName, parentFormData) {
  let newFormData = {...formData}

  Object.keys(properties).forEach(async (key) => {
    if (properties[key].lookup) {
      const { collection, field, parameterField } = properties[key].lookup

      if (parentFormData !== undefined) { // pattern is in array field item
        if (parameterField.indexOf(':') > 0) { // parsing array field item
          const arrayRef = parameterField.split(':')
          const arrayField = arrayRef[0]
          const itemField = arrayRef[1]
          
          if (arrayField === parentFieldName) {
            const lookupValue = formData[itemField]
            newFormData[key] = await axios.get(`${API_URL}/record-lookup?collection_id=${collection}&lookup_field=${itemField}&lookup_value=${lookupValue}&lookup_target_field=${field}`)
              .then(res => res.data.data)
          }
        } else {
          const lookupValue = parentFormData[parameterField]
          newFormData[key] = await axios.get(`${API_URL}/record-lookup?collection_id=${collection}&lookup_field=${parameterField}&lookup_value=${lookupValue}&lookup_target_field=${field}`)
            .then(res => res.data.data)
        }
      } else {
        const lookupValue = formData[parameterField]
        newFormData[key] = await axios.get(`${API_URL}/record-lookup?collection_id=${collection}&lookup_field=${parameterField}&lookup_value=${lookupValue}&lookup_target_field=${field}`)
          .then(res => res.data.data)
      }
    }
    else if (properties[key].type === 'array') {
      if (formData[key] !== undefined) {
        newFormData[key].forEach(async (item, childKey) => {
            newFormData[key][childKey] = await lookUpValue(properties[key].items.properties, formData[key][childKey], key, formData).then(data => data)
        })
      }
    }
  })

  return new Promise((resolve,reject) => resolve(newFormData))
}

const onChange = ({ schema, formData }) => {
    const { properties } = schema
    
    this.updateTotalCell(properties)
    
    lookUpValue(properties, formData).then(newFormData => {
      const temp = {...newFormData}
      const newFormData2 = computeValueByFormula(properties, temp)
        this.setState({ formData: newFormData2 })
      
      // setTimeout(() => {
      //  const newFormData2 = computeValueByFormula(properties, newFormData)
      //  this.setState({ formData: newFormData2 })
      // }, 2000)
    })
  }