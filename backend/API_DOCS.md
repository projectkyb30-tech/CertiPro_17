# CertiPro API Documentation

## Authentication
All admin routes require `Authorization: Bearer <token>` header.

## Admin Endpoints

### Stats
- **GET** `/api/admin/stats`
  - Returns dashboard statistics (users, courses, revenue).

### Users
- **GET** `/api/admin/users?page=1&limit=10`
  - List users with pagination.
- **PUT** `/api/admin/users/:id`
  - Update user role or ban status.
  - Body: `{ role: 'admin'|'user'|'instructor', banned: boolean }`
- **POST** `/api/admin/users/bulk-delete`
  - Delete multiple users.
  - Body: `{ ids: ['uuid1', 'uuid2'] }`

### Courses
- **GET** `/api/admin/courses`
  - List all courses.
- **POST** `/api/admin/courses`
  - Create a new course.
  - Body: `{ title: string, price: number, category: 'python'|'sql'|... }`
- **GET** `/api/admin/courses/:id`
  - Get course details with modules and lessons.
- **PUT** `/api/admin/courses/:id`
  - Update course and its structure (nested modules/lessons).
  - Body: `{ title, ..., modules: [{ title, lessons: [...] }] }`
- **POST** `/api/admin/courses/bulk-delete`
  - Delete multiple courses.
  - Body: `{ ids: ['id1', 'id2'] }`

### Modules & Lessons
- **POST** `/api/admin/modules`
  - Create a module.
- **POST** `/api/admin/lessons`
  - Create a lesson.
  - Body: `{ module_id, title, type: 'text'|'react'|'presentation', content, order }`

### Uploads
- **POST** `/api/upload`
  - Upload file (image, video, code/presentation).
  - Returns: `{ url: string }`

## Error Handling
- **400 Bad Request**: Validation failed (returns `details` array).
- **401 Unauthorized**: Missing or invalid token.
- **403 Forbidden**: User is not admin.
- **500 Internal Server Error**: Unexpected server error.
