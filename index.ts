import { mkdir, readFile, readdir, rmdir, writeFile } from 'fs/promises'
import { join, parse } from 'path'
import { v4 } from 'uuid'

function nameOf(value: string) {
  return value.split(/(?=[A-Z])/).map(e => e.toLowerCase()).join(' ')
}

const pathList = await readdir("Q:\\Users\\sawic\\source\\repos\\SoulWorkerResearch\\SoulCore\\SoulWorkerResearch.SoulCore\\IO\\Net\\Opcodes", { withFileTypes: true })

await rmdir('datas', { recursive: true })
await mkdir('datas', { recursive: true })

const projectPath = "Q:\\Users\\sawic\\source\\repos\\SoulWorkerResearch\\soulworker-network-analyzer-project\\project.json"
const project = JSON.parse(await readFile(projectPath, 'utf8'))

await Promise.all(
  pathList.filter(e => e.isFile() && e.name.endsWith('.cs')).map(async dirent => {
    const file = await readFile(join(dirent.parentPath, dirent.name), 'utf8')

    const data = file.split('\n').filter(e => e.includes(' = ')).map(e => e.trim()).map(e => e.replaceAll(',', '')).map(line => {
      const [name, code] = line.split(' = ')

      return {
        uuid: v4(),
        name: nameOf(name),
        code: Number(code),
        comment: ""
      }
    })

    const opcodeName = nameOf(parse(dirent.name).name).replaceAll('opcode', '').trim();

    const opcode = project["opcodeList"].find((e: { name: string }) => e["name"] === opcodeName);
    if (!opcode) {
      console.log('not found: ', opcodeName);
    } else {
      opcode["commandList"] = data;
    }
  })
)

await writeFile(projectPath, JSON.stringify(project, null, 2), 'utf8')
