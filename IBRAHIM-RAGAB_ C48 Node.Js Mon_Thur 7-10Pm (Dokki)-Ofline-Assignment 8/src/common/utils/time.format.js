export const formatDuration = (totalSeconds) => {
    const s = Math.max(0, Math.ceil(totalSeconds))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60

    const parts = []
    if (h) parts.push(`${h} ${h === 1 ? "hour" : "hours"}`)
    if (m) parts.push(`${m} ${m === 1 ? "minute" : "minutes"}`)
    if (sec && !h) parts.push(`${sec} ${sec === 1 ? "second" : "seconds"}`)

    return parts.join(" and ") || "a moment"
}