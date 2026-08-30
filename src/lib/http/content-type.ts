const PARAMETER_PATTERN =
  /^\s*;\s*[!#$%&'*+\-.^_`|~A-Za-z\d]+\s*=\s*(?:[!#$%&'*+\-.^_`|~A-Za-z\d]+|"(?:[\t !#-\u{5B}\u{5D}-~]|\\[\t !-~])*")/u

export function isJsonContentType(value: null | string): boolean {
  if (value === null) {
    return false
  }

  const separatorIndex = value.indexOf(';')
  const mediaType = (separatorIndex === -1 ? value : value.slice(0, separatorIndex)).trim()

  if (mediaType.toLowerCase() !== 'application/json') {
    return false
  }

  let parameters = separatorIndex === -1 ? '' : value.slice(separatorIndex)
  while (parameters.length > 0) {
    const match = PARAMETER_PATTERN.exec(parameters)
    if (match === null) {
      return false
    }

    parameters = parameters.slice(match[0].length)
  }

  return true
}
