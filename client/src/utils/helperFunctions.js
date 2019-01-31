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
    else if (value.type === 'array') {
      let newItems = { ...value.items }
      const itemProperties = newItems.properties

      const promisedItemProperties = Object.keys(itemProperties).reduce(async (itemObj, itemKey) => {
        const itemValue = itemProperties[itemKey]
        let newItemProperty = { [itemKey] : itemValue }

        const dataCheck = getDataFromStringPattern(itemValue.default)

        if (dataCheck.isPatternExist) {
          const dataPath = dataCheck.data.split('.')
          const categoryGroup = dataPath[0]

          let enum_array = []
          let newItemDefaultValue = 'data not found: ' + itemValue.default

          if (categoryGroup === 'user') {
            const field = dataPath[2]
            newItemDefaultValue = user[field]
          } 
          else if (categoryGroup === 'collection') {
            const category = dataPath[1]
            const field = dataPath[2]
            const recordId = dataPath[3]

            if (field === 'key') {
              enum_array = await axios.get(`${API_URL}/record?id=${category}&record_id=${recordId}`)
                .then(res => res.data.enum.map(item => item.field))
              newItemDefaultValue = enum_array[0]
            } else {
              newItemDefaultValue = await axios.get(`${API_URL}/record?id=${category}&record_id=${recordId}`)
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

              newItemDefaultValue = `${year}-${month}-${date}`
            }
          }

          newItemProperty = {
            [itemKey] : {
              ...itemValue,
              default: newItemDefaultValue
            }
          }

          if (enum_array.length > 0) {
            newItemProperty = {
              ...newItemProperty,
              [itemKey] : {
                ...newItemProperty[itemKey],
                enum: enum_array,
              }
            }
          }
        }

        return itemObj.then(promisedItemObj => ({
          ...promisedItemObj,
          ...newItemProperty
        }))
      }, Promise.resolve({}))

      newProperty = await promisedItemProperties.then(newItemProperties => {
        newProperty = {
          [key] : {
            ...value,
            items: {
              ...value.items,
              properties: newItemProperties
            }
          }
        }
        return newProperty
      })
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