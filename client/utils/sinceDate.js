const sinceDate = date =>{
    const SECOND = 1000
    const MINUTE = 60 * SECOND
    const HOUR = 60 * MINUTE
    const DAY = 24 * HOUR
    const WEEK = 7 * DAY
    const MONTH = 30 * DAY
    const YEAR = 365 * DAY
    const units = [
        { max: 30 * SECOND, divisor: 1, past1: 'Just now', pastN: 'just now', future1: 'Just now', futureN: 'just now' },
        { max: MINUTE, divisor: SECOND, past1: '1 sec', pastN: '# sec', future1: 'in 1 sec', futureN: 'in # sec' },
        { max: HOUR, divisor: MINUTE, past1: '1 min', pastN: '# min', future1: 'in 1 min', futureN: 'in # min' },
        { max: DAY, divisor: HOUR, past1: '1 h', pastN: '# h', future1: 'in 1 h', futureN: 'in # h' },
        { max: WEEK, divisor: DAY, past1: 'Yesterday', pastN: '# days', future1: 'tomorrow', futureN: 'in # days' },
        { max: 4 * WEEK, divisor: WEEK, past1: 'last week', pastN: '# weeks', future1: 'in a week', futureN: 'in # weeks' },
        { max: YEAR, divisor: MONTH, past1: 'Last month', pastN: '# months', future1: 'in a month', futureN: 'in # months' },
        { max: 100 * YEAR, divisor: YEAR, past1: 'Last year', pastN: '# years', future1: 'in a year', futureN: 'in # years' },
        { max: 1000 * YEAR, divisor: 100 * YEAR, past1: 'Last century', pastN: '# centuries', future1: 'in a century', futureN: 'in # centuries' },
        { max: Infinity, divisor: 1000 * YEAR, past1: 'Last millennium', pastN: '# millennia', future1: 'in a millennium', futureN: 'in # millennia' },
    ]
    const diff = Date.now() - (typeof date === 'object' ? date : new Date(date)).getTime()
    const diffAbs = Math.abs(diff)
    for (const unit of units) {
        if (diffAbs < unit.max) {
            const isFuture = diff < 0
            const x = Math.round(Math.abs(diff) / unit.divisor)
            if (x <= 1) return isFuture ? unit.future1 : unit.past1
            return (isFuture ? unit.futureN : unit.pastN).replace('#', x)
        }
    }
}

export default sinceDate