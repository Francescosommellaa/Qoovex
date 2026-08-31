import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import ts from "typescript"

// Audit explicit JSX contracts, not runtime DOM or inferred business rules.
export function labelRequiredIssues(source, fileName = "consumer.tsx") {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const labels = new Set()
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || !/components\/label$/.test(statement.moduleSpecifier.text)) continue
    const bindings = statement.importClause?.namedBindings
    if (bindings && ts.isNamedImports(bindings)) {
      for (const item of bindings.elements) {
        if ((item.propertyName ?? item.name).text === "Label") labels.add(item.name.text)
      }
    }
  }
  const elements = []
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) elements.push(node)
    ts.forEachChild(node, visit)
  }
  visit(file)
  function prop(node, name) {
    const attribute = node.attributes.properties.find((item) => ts.isJsxAttribute(item) && item.name.getText(file) === name)
    if (!attribute) return undefined
    if (!attribute.initializer) return "true"
    if (ts.isStringLiteral(attribute.initializer)) return JSON.stringify(attribute.initializer.text)
    let expression = attribute.initializer.expression
    // Boolean DOM props treat false and undefined identically.
    if (expression && ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.BarBarToken && expression.right.getText(file) === "undefined") expression = expression.left
    return expression && ts.isStringLiteral(expression) ? JSON.stringify(expression.text) : expression?.getText(file)
  }
  const issues = []
  function scope(node) {
    while (node.parent && !ts.isFunctionLike(node)) node = node.parent
    return node
  }
  for (const label of elements.filter((node) => labels.has(node.tagName.getText(file)))) {
    const target = prop(label, "htmlFor")
    if (!target) continue
    for (const control of elements.filter((node) => node !== label && scope(node) === scope(label) && prop(node, "id") === target)) {
      // A spread-only contract is owned by the wrapper's runtime tests.
      if (control.attributes.properties.some(ts.isJsxSpreadAttribute) && !prop(control, "required") && !prop(control, "aria-required")) continue
      const required = prop(control, "required") ?? (prop(control, "aria-required") === '"true"' ? "true" : prop(control, "aria-required")) ?? "false"
      const marker = prop(label, "required") ?? "false"
      const optional = prop(label, "optional")
      const location = file.getLineAndCharacterOfPosition(label.getStart(file))
      if (required !== marker || (required === "true" && optional && optional !== "false")) {
        issues.push(`${fileName}:${location.line + 1}: Label for ${target}: required=${marker}, control required=${required}${optional ? `, optional=${optional}` : ""}`)
      }
    }
  }
  return issues
}

export function auditLabelRequiredDirectory(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) return auditLabelRequiredDirectory(file)
    return entry.name.endsWith(".tsx") ? labelRequiredIssues(readFileSync(file, "utf8"), file) : []
  })
}
