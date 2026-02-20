# Data Model Documentation

This document describes the data model used across the Notes App, including both the Notes module and the Projects module. All entities follow the same architectural pattern with DynamoDB-compatible keys for future cloud sync support.

---

## Base Entity

All entities extend `BaseEntity` and include `DynamoDBKeys`:

```
BaseEntity {
  id: string          — Unique identifier (ULID)
  createdAt: number   — Unix timestamp (ms) of creation
  updatedAt: number   — Unix timestamp (ms) of last update
}

DynamoDBKeys {
  PK: string          — Partition key for DynamoDB (e.g., USER#<ownerId>)
  SK: string          — Sort key for DynamoDB (e.g., NOTE#<id>)
}
```

---

## Notes Module

### Note
Represents a user's note document.

| Field       | Type           | Description                          |
|-------------|----------------|--------------------------------------|
| id          | string         | ULID                                 |
| PK          | string         | `USER#<ownerId>`                     |
| SK          | string         | `NOTE#<noteId>`                      |
| ownerId     | string         | Owner identifier (`local` for offline) |
| folderId    | string \| null | Parent folder ID or null for root    |
| title       | string         | Note title                           |
| content     | string         | JSON string of editor content        |
| blocks      | Block[]        | Structured content blocks            |
| isPinned    | boolean        | Whether the note is pinned           |
| isArchived  | boolean        | Whether the note is archived         |
| isTrashed   | boolean        | Whether the note is trashed          |
| createdAt   | number         | Creation timestamp                   |
| updatedAt   | number         | Last update timestamp                |

### Folder
Represents a folder for organizing notes.

| Field       | Type           | Description                          |
|-------------|----------------|--------------------------------------|
| id          | string         | ULID                                 |
| PK          | string         | `USER#<ownerId>`                     |
| SK          | string         | `FOLDER#<folderId>`                  |
| ownerId     | string         | Owner identifier                     |
| parentId    | string \| null | Parent folder ID or null for root    |
| name        | string         | Folder name                          |
| icon        | string?        | Optional icon identifier             |
| color       | string?        | Optional color identifier            |
| isExpanded  | boolean        | Whether the folder is expanded in UI |
| position    | number         | Sort order among siblings            |
| createdAt   | number         | Creation timestamp                   |
| updatedAt   | number         | Last update timestamp                |

### Block
Represents a content block within a note.

| Field       | Type                    | Description                     |
|-------------|-------------------------|---------------------------------|
| id          | string                  | ULID                            |
| PK          | string                  | `NOTE#<noteId>`                 |
| SK          | string                  | `BLOCK#<position>#<blockId>`    |
| noteId      | string                  | Parent note ID                  |
| type        | BlockType               | Block type (see below)          |
| content     | string                  | Block content                   |
| position    | number                  | Sort order within note          |
| metadata    | Record<string, unknown>?| Optional metadata               |
| createdAt   | number                  | Creation timestamp              |
| updatedAt   | number                  | Last update timestamp           |

**BlockType** values: `paragraph`, `heading1`, `heading2`, `heading3`, `bulletList`, `orderedList`, `taskList`, `codeBlock`, `blockquote`, `divider`, `image`

---

## Projects Module

### Project
Represents a user's project containing tasks.

| Field       | Type         | Description                              |
|-------------|--------------|------------------------------------------|
| id          | string       | ULID                                     |
| PK          | string       | `USER#<ownerId>`                         |
| SK          | string       | `PROJECT#<projectId>`                    |
| ownerId     | string       | Owner identifier (`local` for offline)   |
| name        | string       | Project name                             |
| description | string       | Project description (empty string if not set) |
| color       | ProjectColor | Project color theme                      |
| createdAt   | number       | Creation timestamp                       |
| updatedAt   | number       | Last update timestamp                    |

**ProjectColor** values: `blue`, `purple`, `rose`, `orange`, `green`, `teal`, `amber`, `slate`

**Progress**: Calculated at runtime from tasks — not stored. Formula: `completed_tasks / total_tasks * 100`

### Task
Represents a task within a project.

| Field       | Type    | Description                             |
|-------------|---------|-----------------------------------------|
| id          | string  | ULID                                    |
| PK          | string  | `PROJECT#<projectId>`                   |
| SK          | string  | `TASK#<taskId>`                          |
| projectId   | string  | Parent project ID                       |
| title       | string  | Task title                              |
| description | string  | Task description (empty string if not set) |
| isCompleted | boolean | Whether the task is completed           |
| position    | number  | Sort order within project               |
| createdAt   | number  | Creation timestamp                      |
| updatedAt   | number  | Last update timestamp                   |

---

## Relationships

```
User (ownerId)
├── Notes
│   ├── Folders (nested via parentId)
│   └── Notes (organized by folderId)
│       └── Blocks (ordered by position)
└── Projects
    └── Tasks (ordered by position)
```

---

## Storage

- **Local**: Dexie.js (IndexedDB wrapper) — version 2 schema
- **Keys Design**: PK/SK pattern enables future DynamoDB migration for cloud sync
- **IDs**: Generated via ULID (Universally Unique Lexicographically Sortable Identifier)

## Indexed Fields (Dexie)

### notes table
`id, PK, SK, ownerId, folderId, title, createdAt, updatedAt, isPinned, isArchived, isTrashed`

### folders table
`id, PK, SK, ownerId, parentId, name, position, createdAt, updatedAt`

### projects table
`id, PK, SK, ownerId, name, color, createdAt, updatedAt`

### tasks table
`id, PK, SK, projectId, title, isCompleted, position, createdAt, updatedAt`
