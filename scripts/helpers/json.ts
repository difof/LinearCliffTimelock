import { writeFileSync } from 'fs'
import { join } from 'path'
import moment from 'moment'

export function writeJsonNow(path: string, prefix: string, data: any) {
    const now = moment().utc().format('YYYY-MM-DD_HH-mm-ss')
    writeFileSync(
        join(path, prefix + '-' + now + '.json'),
        JSON.stringify(data, null, 2)
    )
}
