import axios from 'axios'
import API_URL from './api_url'

// check whether a string is empty or only contain whitespaces
export function isEmptyString (string) {
	return /^\s*$/.test(string)
}

// beautify JSON object to string with 2 spaces indentation
export function stringifyPrettyJSON (object) {
	return JSON.stringify(object, undefined, 2)
}

// allow user to make indentation with tab when editing JSON string in textarea
export function handleTabPressedOnJSONTextarea (event, textarea) {
	if(event.keyCode === 9) {
		event.preventDefault()

		let v = textarea.value,
		s = textarea.selectionStart,
		e = textarea.selectionEnd

		textarea.value = v.substring(0, s) + '\t' + v.substring(e)
		textarea.selectionStart = textarea.selectionEnd = s + 1
	}
}

// convert data URL base64 format to Blob
export function dataURLtoBlob (dataURL) {
    // convert base64 to raw binary data held in a string
    const byteString = atob(dataURL.split(',')[1]);

    // separate out the mime component
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], {type: mimeString});
}

// download files from object URL
export function downloadURI (uri, name) {
  let link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// extract data from double angle brackets string pattern: <<data>
export function getDataFromStringPattern (rawString) {
  const pattern = /^<<\S+>>$/
  let data = rawString
  let isPatternExist = false

  if (pattern.test(rawString)) {
    data = rawString.slice(2, rawString.length - 2)
    isPatternExist = true
  }

  return { data, isPatternExist }
}

// replace string pattern in default value json schema form 
// with data from system or database
export function replaceDefaultValueStringPatternWithData (formStructure, user) {
  let newFormStructure = {...formStructure}
  const properties = newFormStructure.properties

  const promisedProperties = Object.keys(properties).reduce(async (obj, key) => {
    const value = properties[key]
    let newProperty = { [key] : value }

    if (value.type !== 'array') {
      const dataCheck = getDataFromStringPattern(value.default)

      if (dataCheck.isPatternExist) {
        const dataPath = dataCheck.data.split('.')
        const categoryGroup = dataPath[0]

        let enum_array = []
        let newDefaultValue = 'data not found: ' + value.default

        if (categoryGroup === 'user') {
          const field = dataPath[2]

          newDefaultValue = user[field]
        }
        else if (categoryGroup === 'collection') {
          const category = dataPath[1]
          const field = dataPath[2]
          const recordId = dataPath[3]

          if (field === 'key') {
            enum_array = await axios.get(`${API_URL}/record?id=${category}&record_id=${recordId}`)
              .then(res => res.data.enum.map(item => item.field))

            newDefaultValue = enum_array[0]
          } else {
            newDefaultValue = await axios.get(`${API_URL}/record?id=${category}&record_id=${recordId}`)
              .then(res => res.data[field])
          }
        }
        else if (categoryGroup === 'date') {
          const datePattern = dataPath[1].split(':')

          if (datePattern[0] === 'today') {
            const today = new Date()
            const offset = Number(datePattern[1])

            let year = today.getYear() + 1900
            let month = today.getMonth()
            let date = today.getDate() + offset

            const targetDate = new Date(year, month, date)

            year = targetDate.getYear() + 1900
            month = targetDate.getMonth() + 1
            date = targetDate.getDate()

            date = date < 10 ? '0' + date : date
            month = month < 10 ? '0' + month : month

            newDefaultValue = `${year}-${month}-${date}`
          }
        }
        else if (categoryGroup === 'formula') {
          const formula = dataPath[1]

          newProperty = {
            [key] : {
              ...value,
              formula,
              default: ''
            }
          }
        }

        if (categoryGroup !== 'formula') {
          newProperty = {
            [key] : {
              ...value,
              default: newDefaultValue
            }
          }

          if (enum_array.length > 0) {
            newProperty = {
              ...newProperty,
              [key] : {
                ...newProperty[key],
                enum: enum_array
              }
            }
          }
        }
      }
    }
    else if (value.type === 'array') {
      let newItems = { ...value.items }

      newProperty = {
        [key] : {
          ...value,
          items: await replaceDefaultValueStringPatternWithData(newItems).then(newItemsStructure => newItemsStructure)
        }
      }
    }

    return obj.then(promisedObj => ({
        ...promisedObj,
        ...newProperty
    }))
  }, Promise.resolve({}))

  return promisedProperties.then(newProperties => {
    newFormStructure.properties = newProperties
    return newFormStructure
  })
}

// recursive function to do math calculation on string formula input
// use case: mathCalculation("1 * 2 + 4 / 2 - 6")
export function mathCalculation (formula) {
  const plusOperator = '+'
  const minusOperator = '-'
  const multiplyOperator = '*'
  const divideOperator = '/'
  
  if (formula.indexOf(plusOperator) > 0) {
    const operands = formula.split(plusOperator)
    let total = 0

    operands.forEach(operand => {
      total = total + mathCalculation(operand)
    })

    return total
  }
  
  else if (formula.indexOf(minusOperator) > 0) {
    const operands = formula.split(minusOperator)
    let total = 0

    operands.forEach((operand, index) => {
      if (index === 0) {
        total = mathCalculation(operand)
      } 
      else {
        total = total - mathCalculation(operand)
      }
    })

    return total
  }
  
  else if (formula.indexOf(multiplyOperator) > 0) {
    const operands = formula.split(multiplyOperator)
    let total = 1

    operands.forEach(operand => {
      total = total * mathCalculation(operand)
    })

    return total
  }
  
  else if (formula.indexOf(divideOperator) > 0) {
    const operands = formula.split(divideOperator)
    let total = 1

    operands.forEach((operand, index) => {
      if (index === 0) {
        total = mathCalculation(operand)
      }
      else {
        total = total / mathCalculation(operand)
      }
    })

    return total
  }

  return Number(formula)
}

// compute field value based on value of other fields
export function computeValueByFormula (properties, formData) {
  let newFormData = {...formData}

  Object.keys(properties).forEach(key => {
    if (properties[key].formula) {
      const formula = properties[key].formula
      
      let operands = formula.replace(/\+|\-|\*|\//g, ' ').split(' ')
      operands = operands.map(operand => formData[operand])

      if (properties[key].type === 'number') {
        const operators = formula.replace(/\w/g, '').split('')
        const updatedFormula = operands.map(operand => operators.length > 0 ? operand + operators.shift() : operand).join('')
        newFormData[key] = mathCalculation(updatedFormula)
      } 
      else if (properties[key].type === 'string'){
        newFormData[key] = operands.join(' ')
      }
    }
    else if (properties[key].type === 'array') {
      if (formData[key] !== undefined) {
        newFormData[key] = formData[key].map((item, childKey) => 
          computeValueByFormula(properties[key].items.properties, formData[key][childKey])
        )
      }
    }
  })

  return newFormData
}