// check whether a string is empty or only contain whitespaces
export function isEmptyString (string) {
	return /^\s*$/.test(string)
}

// beautify JSON string with 2 spaces indentation
export function stringifyPrettyJSON (object) {
	return JSON.stringify(object, undefined, 2)
}