import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const rootDir = process.cwd()
const sourceDir = path.join(rootDir, "apps", "storefront", "src")
const forbiddenPatterns = [/\bconsole\.log\s*\(/, /\bconsole\.debug\s*\(/]
const ignoredDirectories = new Set(["node_modules", ".next"])

const walk = (directory) => {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        return []
      }

      return walk(fullPath)
    }

    if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      return []
    }

    return [fullPath]
  })
}

const violations = walk(sourceDir).flatMap((filePath) => {
  const relativePath = path.relative(rootDir, filePath)
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/)

  return lines.flatMap((line, index) => {
    if (!forbiddenPatterns.some((pattern) => pattern.test(line))) {
      return []
    }

    return [`${relativePath}:${index + 1}: ${line.trim()}`]
  })
})

if (violations.length) {
  console.error("Forbidden storefront debug logs found:")
  violations.forEach((violation) => console.error(`- ${violation}`))
  process.exit(1)
}

console.log("Storefront debug log validation passed")
