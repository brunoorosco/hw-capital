import * as path from 'path'
import moduleAlias from 'module-alias'

const dir = path.resolve(__dirname, '../')

moduleAlias.addAliases({
  '@': dir,
})
