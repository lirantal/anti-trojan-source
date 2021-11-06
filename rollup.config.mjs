import fs from 'fs'
const srcFiles = await fs.promises.readdir(new URL('./src', import.meta.url))

export default {
  input: srcFiles.filter((file) => file.endsWith('.js')).map((x) => `src/${x}`),
  output: {
    dir: 'cjs',
    format: 'cjs',
    entryFileNames: '[name].cjs',
    preserveModules: true
  }
}
