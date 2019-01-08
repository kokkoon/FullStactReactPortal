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