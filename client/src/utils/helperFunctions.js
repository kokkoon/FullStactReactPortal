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
export function dataURLtoBlob(dataURL) {
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
export function downloadURI(uri, name) {
  let link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}