# UI & Styling Conventions

- **Primary Objective:** ALWAYS use Shadcn UI components and Tailwind CSS for building UI elements. Do not create raw HTML elements if a Shadcn equivalent exists.
- **Tool Usage:** Before generating any UI code, ALWAYS use the `shadcn-ui` MCP server tools (such as `get_component`, `list_components`, or `get_component_demo`) to retrieve the exact, up-to-date TypeScript source code. 
- **Implementation:** Follow Next.js App Router conventions. Never write custom CSS or inline styles if a standard Shadcn component or Tailwind utility class can achieve the desired design.