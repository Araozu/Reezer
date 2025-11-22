# Agent Instructions for Reezer

## Build/Test Commands

### Frontend (Web/SvelteKit)
- **Development server**: `cd Web && npm run dev` or `pnpm dev`
- **Build**: `cd Web && npm run build` or `pnpm build`
- **TypeScript/Svelte check**: `cd Web && npm run check` or `pnpm check`
- **Watch mode check**: `cd Web && npm run check:watch` or `pnpm check:watch`

### Backend (.NET)
- **Build solution**: `dotnet build`
- **Run API**: `cd Api && dotnet run`

## Code Style Guidelines

### TypeScript/JavaScript
- **Strict mode**: Enabled in tsconfig.json
- **Imports**: Use named imports, group by external libraries first, then internal ($lib)
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces
- **Types**: Use explicit typing, prefer interfaces over types for object shapes
- **Error handling**: Throw objects with `message` property: `throw { message: "Error description" }`

### Svelte
- **Version**: Svelte 5 with runes syntax
- **Props**: Use `$props()` for component props
- **Bindings**: Use `$bindable()` for two-way bindings
- **Events**: Use `onevent` syntax
- **Styling**: Tailwind CSS with custom variants using tailwind-variants

### C#
- **Framework**: .NET 10.0
- **Nullable**: Enabled
- **Implicit usings**: Enabled
- **Formatting**: Use CSharpier for consistent formatting
- **Naming**: PascalCase for classes/methods/properties, camelCase for local variables
- **Features**: Always use primary constructor, file namespaces, records for DTOs
- **EF**: When writing Fluent configuration, NEVER use the Fluent API for things that convention-based entities already cover

- Use `record` classes for DTOs
- Use primary constructors
- Error handling uses the `OneOf` library and the types defined at `Domain/Utils/ErrorTypes.cs`
- Non 2XX API responses **MUST** use `ProblemDetails` with at least `Details`
- If an operation cannot fail, just return the data, without wrapping it in `OneOf`


### General
- **No comments**: Avoid adding comments unless explicitly requested
- **Security**: Never expose secrets/keys, follow security best practices
- **Libraries**: Verify library availability before using (check package.json/.csproj files)
