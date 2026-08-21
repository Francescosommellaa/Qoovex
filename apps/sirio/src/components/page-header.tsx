export function PageHeader({
  title,
  description,
  importPath,
}: {
  title: string;
  description: string;
  importPath?: string;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
      {importPath && (
        <code className="relative max-w-full whitespace-pre-wrap break-words rounded-md bg-muted px-4 py-2 font-mono text-sm shadow-sm ring-1 ring-border">
          {importPath}
        </code>
      )}
    </header>
  );
}
