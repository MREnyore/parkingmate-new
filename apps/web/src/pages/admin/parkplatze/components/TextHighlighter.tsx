interface TextHighlighterProps {
  text: string | number
  searchQuery: string
}

export function TextHighlighter({ text, searchQuery }: TextHighlighterProps) {
  const textStr = String(text)

  if (!searchQuery.trim()) {
    return <>{textStr}</>
  }

  const regex = new RegExp(`(${searchQuery})`, 'gi')
  const parts = textStr.split(regex)

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 text-black">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  )
}
