import type { Meta, StoryObj } from '@storybook/react';
import { ThemedMDXEditorWithProvider } from '../src/components/ThemedMDXEditorWithProvider';
import {
  headingsPlugin,
  listsPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  UndoRedo,
  DiffSourceToggleWrapper,
} from '@principal-ai/mdx-editor';
import React from 'react';
import { useThemedMDXEditor } from '../src/hooks/useThemedMDXEditor';

/**
 * Helper to create themed plugins with CodeMirror extensions for syntax highlighting
 */
function useCodeBlockPlugins() {
  const { getCodeMirrorExtensions } = useThemedMDXEditor();

  return React.useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          javascript: 'JavaScript',
          typescript: 'TypeScript',
          jsx: 'JSX',
          tsx: 'TSX',
          python: 'Python',
          java: 'Java',
          go: 'Go',
          rust: 'Rust',
          cpp: 'C++',
          c: 'C',
          csharp: 'C#',
          php: 'PHP',
          ruby: 'Ruby',
          swift: 'Swift',
          kotlin: 'Kotlin',
          css: 'CSS',
          scss: 'SCSS',
          html: 'HTML',
          json: 'JSON',
          yaml: 'YAML',
          xml: 'XML',
          markdown: 'Markdown',
          bash: 'Bash',
          shell: 'Shell',
          sql: 'SQL',
          graphql: 'GraphQL',
          dockerfile: 'Dockerfile',
          mermaid: 'Mermaid',
          text: 'Plain Text',
          '': 'Unspecified',
        },
        codeMirrorExtensions: getCodeMirrorExtensions(),
      }),
      toolbarPlugin({
        toolbarContents: () => (
          <DiffSourceToggleWrapper>
            <UndoRedo />
          </DiffSourceToggleWrapper>
        ),
      }),
    ],
    [getCodeMirrorExtensions]
  );
}

/**
 * Wrapper component to provide themed plugins to code block stories
 */
function CodeBlockEditor(props: React.ComponentProps<typeof ThemedMDXEditorWithProvider>) {
  const plugins = useCodeBlockPlugins();
  return <ThemedMDXEditorWithProvider {...props} plugins={props.plugins || plugins} />;
}

const meta = {
  title: 'Examples/Code Blocks',
  component: CodeBlockEditor,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CodeBlockEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// JavaScript Example
const jsMarkdown = `# JavaScript Code Examples

## Array Methods

\`\`\`javascript
const users = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 }
];

// Filter, map, and reduce
const adults = users
  .filter(user => user.age >= 18)
  .map(user => ({ ...user, status: 'active' }));

const totalAge = users.reduce((sum, user) => sum + user.age, 0);
const avgAge = totalAge / users.length;
\`\`\`

## Async/Await

\`\`\`javascript
async function fetchUserData(userId) {
  try {
    const response = await fetch('/api/users/' + userId);
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}
\`\`\`
`;

export const JavaScript: Story = {
  args: {
    markdown: jsMarkdown,
  },
};

// TypeScript Example
const tsMarkdown = `# TypeScript Code Examples

## Interfaces and Types

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// Generic function
async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  return response.json();
}
\`\`\`

## Type Guards and Utility Types

\`\`\`typescript
function isUser(obj: any): obj is User {
  return typeof obj === 'object' && 'id' in obj && 'name' in obj;
}

type PartialUser = Partial<User>;
type ReadonlyUser = Readonly<User>;
type UserWithoutEmail = Omit<User, 'email'>;
\`\`\`
`;

export const TypeScript: Story = {
  args: {
    markdown: tsMarkdown,
  },
};

// Python Example
const pythonMarkdown = `# Python Code Examples

## List Comprehensions

\`\`\`python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squares = [x**2 for x in numbers if x % 2 == 0]
cubes = (x**3 for x in numbers)  # Generator

# Dictionary comprehension
scores = {'Alice': 85, 'Bob': 92, 'Charlie': 78}
passed = {name: score for name, score in scores.items() if score >= 80}
\`\`\`

## Classes and Inheritance

\`\`\`python
class Animal:
    def __init__(self, name, species):
        self.name = name
        self.species = species

    def make_sound(self):
        pass

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name, "Dog")
        self.breed = breed

    def make_sound(self):
        return "Woof!"
\`\`\`
`;

export const Python: Story = {
  args: {
    markdown: pythonMarkdown,
  },
};

// Go Example
const goMarkdown = `# Go Code Examples

## Structs and Methods

\`\`\`go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type User struct {
    ID    int    \`json:"id"\`
    Name  string \`json:"name"\`
    Email string \`json:"email"\`
}

func (u *User) Display() string {
    return fmt.Sprintf("%s (%s)", u.Name, u.Email)
}
\`\`\`

## Goroutines and Channels

\`\`\`go
func processData(data []int) <-chan int {
    results := make(chan int)

    go func() {
        defer close(results)
        for _, value := range data {
            results <- value * 2
        }
    }()

    return results
}
\`\`\`
`;

export const Go: Story = {
  args: {
    markdown: goMarkdown,
  },
};

// Rust Example
const rustMarkdown = `# Rust Code Examples

## Structs and Implementations

\`\`\`rust
#[derive(Debug, Clone)]
struct User {
    id: u32,
    name: String,
    email: String,
}

impl User {
    fn new(id: u32, name: String, email: String) -> Self {
        User { id, name, email }
    }

    fn display(&self) -> String {
        format!("{} ({})", self.name, self.email)
    }
}
\`\`\`

## Error Handling with Result

\`\`\`rust
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Cannot divide by zero".to_string())
    } else {
        Ok(a / b)
    }
}

// Pattern matching
fn process_value(value: Option<i32>) -> i32 {
    match value {
        Some(n) if n > 0 => n * 2,
        Some(n) => n,
        None => 0,
    }
}
\`\`\`
`;

export const Rust: Story = {
  args: {
    markdown: rustMarkdown,
  },
};

// SQL Example
const sqlMarkdown = `# SQL Code Examples

## Table Creation

\`\`\`sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
\`\`\`

## Complex Queries

\`\`\`sql
SELECT
    u.username,
    u.email,
    COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY u.id, u.username, u.email
HAVING COUNT(p.id) > 0
ORDER BY post_count DESC
LIMIT 10;
\`\`\`
`;

export const SQL: Story = {
  args: {
    markdown: sqlMarkdown,
  },
};

// Multiple Languages Story
const multiLangMarkdown = `# Multiple Programming Languages

## JavaScript
\`\`\`javascript
const greet = (name) => console.log('Hello, ' + name + '!');
greet('World');
\`\`\`

## TypeScript
\`\`\`typescript
interface Greeting {
  name: string;
  message: string;
}

const greet = (g: Greeting): void => {
  console.log(g.message + ', ' + g.name + '!');
};
\`\`\`

## Python
\`\`\`python
def greet(name):
    print(f"Hello, {name}!")

greet("World")
\`\`\`

## Go
\`\`\`go
func greet(name string) {
    fmt.Printf("Hello, %s!\\n", name)
}
\`\`\`

## Rust
\`\`\`rust
fn greet(name: &str) {
    println!("Hello, {}!", name);
}
\`\`\`
`;

export const MultipleLanguages: Story = {
  args: {
    markdown: multiLangMarkdown,
  },
};

// JSON and Config Files
const configMarkdown = `# Configuration Files

## package.json
\`\`\`json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "build": "npm run clean && npm run compile",
    "test": "jest",
    "lint": "eslint src"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
\`\`\`

## Docker Compose
\`\`\`yaml
version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
\`\`\`
`;

export const ConfigFiles: Story = {
  args: {
    markdown: configMarkdown,
  },
};

// Bash/Shell Example
const bashMarkdown = `# Bash/Shell Script

\`\`\`bash
#!/bin/bash

# Variables
PROJECT_NAME="my-app"
BUILD_DIR="./dist"

# Simple build script
echo "Building project..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Run commands
npm ci
npm test
npm run build

echo "Build completed!"
\`\`\`
`;

export const BashShell: Story = {
  args: {
    markdown: bashMarkdown,
  },
};

// Mermaid Diagrams
const mermaidMarkdown = `# Mermaid Diagrams

Mermaid allows you to create diagrams and visualizations using text.

## Flowchart

\`\`\`mermaid
graph TD
    A[User Opens App] -->|Clicks Button| B{Is Authenticated?}
    B -->|Yes| C[Show Dashboard]
    B -->|No| D[Show Login Screen]
    D -->|Login Success| C
    D -->|Login Failed| E[Show Error]
    E -->|Retry| D
    C -->|Logout| D
\`\`\`

## Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database

    User->>Browser: Enter credentials
    Browser->>Server: POST /api/login
    Server->>Database: Query user
    Database-->>Server: User data
    Server-->>Browser: JWT token
    Browser-->>User: Redirect to dashboard
\`\`\`

## Class Diagram

\`\`\`mermaid
classDiagram
    class User {
        +String name
        +String email
        +String id
        +login()
        +logout()
    }

    class Post {
        +String title
        +String content
        +Date createdAt
        +User author
        +publish()
        +delete()
    }

    class Comment {
        +String text
        +User author
        +Post post
        +create()
        +delete()
    }

    User "1" --> "*" Post : creates
    Post "1" --> "*" Comment : has
    User "1" --> "*" Comment : writes
\`\`\`

## State Diagram

\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading : Start Request
    Loading --> Success : Data Received
    Loading --> Error : Request Failed
    Success --> Idle : Reset
    Error --> Idle : Reset
    Error --> Loading : Retry
    Success --> [*]
\`\`\`

## Entity Relationship Diagram

\`\`\`mermaid
erDiagram
    USER ||--o{ POST : creates
    USER ||--o{ COMMENT : writes
    POST ||--o{ COMMENT : has

    USER {
        int id PK
        string name
        string email
        datetime created_at
    }

    POST {
        int id PK
        int user_id FK
        string title
        text content
        datetime published_at
    }

    COMMENT {
        int id PK
        int user_id FK
        int post_id FK
        text content
        datetime created_at
    }
\`\`\`

## Gantt Chart

\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements gathering :done, req, 2024-01-01, 2024-01-15
    Design mockups        :done, design, 2024-01-10, 2024-01-25

    section Development
    Backend API           :active, backend, 2024-01-20, 2024-02-20
    Frontend UI           :frontend, 2024-02-01, 2024-03-01
    Testing              :test, 2024-02-20, 2024-03-10

    section Deployment
    Staging deployment   :staging, 2024-03-05, 2024-03-12
    Production release   :prod, 2024-03-12, 2024-03-15
\`\`\`

## Pie Chart

\`\`\`mermaid
pie title Programming Languages Used
    "JavaScript" : 35
    "TypeScript" : 30
    "Python" : 20
    "Go" : 10
    "Rust" : 5
\`\`\`

## Git Graph

\`\`\`mermaid
gitGraph
    commit id: "Initial commit"
    commit id: "Add authentication"
    branch feature/dashboard
    checkout feature/dashboard
    commit id: "Create dashboard layout"
    commit id: "Add widgets"
    checkout main
    merge feature/dashboard
    commit id: "Release v1.0"
    branch hotfix/login-bug
    checkout hotfix/login-bug
    commit id: "Fix login redirect"
    checkout main
    merge hotfix/login-bug
    commit id: "Release v1.0.1"
\`\`\`
`;

export const MermaidDiagrams: Story = {
  args: {
    markdown: mermaidMarkdown,
  },
};
