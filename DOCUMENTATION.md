# ExpenseTracker Documentation

## Project Overview

ExpenseTracker is a full-stack web application built with Next.js that allows users to track expenses, manage reports, and handle financial data. The application features role-based access control with user and admin roles, authentication using NextAuth.js, and data persistence with PostgreSQL via Prisma ORM.

## API Documentation

The ExpenseTracker API is organized around RESTful principles. All endpoints return JSON responses and use standard HTTP response codes to indicate success or failure. Authentication is required for all API endpoints using NextAuth.js session tokens.

### Authentication API

#### `GET/POST /api/auth/[...nextauth]`

Handles authentication requests through NextAuth.js. This route is automatically generated and managed by NextAuth.js.

- **Authentication Methods**: Email/Password, Google OAuth
- **Response**: Session token for authenticated users

### Expenses API

#### `GET /api/expenses`

Returns a list of expenses for the authenticated user with optional filtering and pagination.

- **Authentication**: Required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `pageSize`: Number of items per page (default: 10)
  - `startDate`: Filter expenses after this date (YYYY-MM-DD)
  - `endDate`: Filter expenses before this date (YYYY-MM-DD)
  - `search`: Search term for expense description or merchant
  - `minAmount`: Minimum expense amount
  - `maxAmount`: Maximum expense amount
  - `category`: Filter by expense category (e.g., TRAVEL, MEALS, etc.)
  - `status`: Filter by expense status (e.g., UNREPORTED, REPORTED, etc.)
- **Response**: JSON array of expense objects with pagination metadata

#### `POST /api/expenses`

Creates a new expense for the authenticated user.

- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "amount": 123.45,
    "date": "2025-07-28",
    "description": "Business lunch",
    "merchant": "Restaurant Name",
    "category": "MEALS",
    "notes": "Client meeting",
    "receiptUrl": "https://example.com/receipt.jpg" // Optional
  }
  ```
- **Response**: Created expense object

#### `GET /api/expenses/[id]`

Returns a single expense by ID.

- **Authentication**: Required
- **Path Parameters**:
  - `id`: Expense ID
- **Response**: Single expense object

#### `PUT /api/expenses/[id]`

Updates an existing expense.

- **Authentication**: Required
- **Path Parameters**:
  - `id`: Expense ID
- **Request Body**: Same as POST but all fields are optional
- **Response**: Updated expense object

#### `DELETE /api/expenses/[id]`

Deletes an expense.

- **Authentication**: Required
- **Path Parameters**:
  - `id`: Expense ID
- **Response**: Success message

#### `GET /api/expenses/[id]/history`

Returns the history of events for a specific expense.

- **Authentication**: Required
- **Path Parameters**:
  - `id`: Expense ID
- **Response**: Object containing expense details and an array of history events
  ```json
  {
    "expense": {
      "id": 123,
      "description": "Business lunch",
      "amount": 123.45,
      "date": "2025-07-28T00:00:00.000Z",
      "status": "REPORTED"
    },
    "history": [
      {
        "id": 1,
        "eventType": "CREATED",
        "eventDate": "2025-07-28T06:30:00.000Z",
        "details": "Expense created",
        "performedBy": {
          "id": "user-id",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "USER"
        },
        "report": null
      },
      {
        "id": 2,
        "eventType": "ADDED_TO_REPORT",
        "eventDate": "2025-07-28T07:15:00.000Z",
        "details": "Added to report",
        "performedBy": {
          "id": "user-id",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "USER"
        },
        "report": {
          "id": 45,
          "title": "July Business Trip",
          "status": "PENDING"
        }
      }
    ]
  }
  ```

#### `GET /api/expenses/categories`

Returns all available expense categories.

- **Authentication**: Required
- **Response**: Array of expense category strings
  ```json
  {
    "categories": ["TRAVEL", "MEALS", "ACCOMMODATION", "SUPPLIES", "SERVICES", "ENTERTAINMENT", "TRANSPORTATION", "UTILITIES", "OFFICE", "OTHER"]
  }
  ```

#### `GET /api/expenses/stats`

Returns expense statistics for the authenticated user.

- **Authentication**: Required
- **Response**: Object containing expense statistics
  ```json
  {
    "totalExpenses": 42,
    "totalAmount": 4567.89,
    "unreportedCount": 5,
    "unreportedAmount": 345.67,
    "byCategory": {
      "MEALS": 1234.56,
      "TRAVEL": 2345.67
    },
    "recentExpenses": [...]
  }
  ```

### File Upload API

#### `POST /api/uploads`

Uploads a file to S3 and returns the URL.

- **Authentication**: Required
- **Request Body**: FormData with a file field named "file"
- **Supported File Types**: JPEG, PNG, PDF
- **Maximum File Size**: 10MB
- **Response**: Object containing the URL of the uploaded file
  ```json
  {
    "url": "https://expense-tracker-receipts.s3.amazonaws.com/1627484930-receipt.jpg"
  }
  ```

## Architecture

### Tech Stack

- **Frontend**: Next.js 15.3.5, React 19.0.0, TailwindCSS 4
- **Backend**: Next.js API routes, Server Actions
- **Authentication**: NextAuth.js 5.0.0-beta.29
- **Database**: PostgreSQL with Prisma ORM 6.11.1
- **Form Handling**: React Hook Form 7.60.0 with Zod 3.25.76 validation
- **UI Components**: Custom components with Radix UI primitives

### Project Structure

- `/actions`: Server actions for authentication (login, register, signout)
- `/app`: Next.js App Router components and routes
  - `/(admin)`: Admin-specific routes
  - `/(users)`: User-specific routes
  - `/api`: API routes including NextAuth endpoints
  - `/auth`: Authentication pages (login, register)
- `/components`: Reusable UI components
- `/data`: Data access functions
- `/lib`: Utility functions and configurations
- `/prisma`: Database schema and configurations
- `/schemas`: Zod validation schemas

## Authentication System

### Implementation

The application implements a role-based authentication system using NextAuth.js with the following features:

1. **Credentials Provider**: Email and password authentication
2. **JWT Session Strategy**: For maintaining user sessions
3. **Role-based Access Control**: User and Admin roles with different permissions
4. **Protected Routes**: Middleware to restrict access based on authentication status and user roles

### Authentication Flow

1. User registers with email/password
2. Credentials are validated using Zod schemas
3. Password is hashed using bcryptjs
4. User signs in with email/password
5. Upon successful authentication, user is redirected based on role:
   - Users → `/user/dashboard`
   - Admins → `/admin/settings`

## Data Models

### User Model

```
model User {
  id            String    @id @default(cuid())
  firstName     String
  lastName      String
  email         String    @unique
  password      String
  image         String?
  emailVerified DateTime?
  Account       Account[]
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Account Model (for OAuth providers)

```
model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([provider, providerAccountId])
}
```

## Features

### User Features

- **Dashboard**: Overview of financial activities
- **Expenses**: Track and manage expense entries
- **Reports**: Generate and view financial reports
- **Settings**: User profile and application settings

### Admin Features

- **Admin Dashboard**: System overview
- **Admin Settings**: Application configuration

### UI Components

- **Navigation**: Responsive navbar and collapsible sidebar
- **Tables**: Data tables for displaying expense and report information
- **Forms**: Form components with validation
- **Notifications**: Toast notifications for user feedback
- **Dashboard Cards**: Summary cards for financial information

## Routing and Access Control

### Public Routes

- `/`: Home page (accessible to all)

### Authentication Routes

- `/auth/login`: Login page
- `/auth/register`: Registration page

### User Routes (requires USER role)

- `/user/dashboard`: User dashboard
- `/user/expenses`: Expense management
- `/user/reports`: Report generation and viewing
- `/user/settings`: User settings

### Admin Routes (requires ADMIN role)

- `/admin/settings`: Admin configuration

### Middleware Protection

The application implements middleware to:

- Redirect unauthenticated users to the login page
- Redirect authenticated users based on their roles
- Prevent users from accessing admin routes and vice versa

## Server Actions

### Register

- Validates user input using Zod schema
- Checks if email already exists
- Hashes password using bcryptjs
- Creates new user record in database

### Login

- Validates credentials
- Determines redirect path based on user role
- Handles authentication errors with appropriate messages

### Signout

- Handles user logout process

## Installation and Setup

1. **Clone the repository**

2. **Install dependencies**

   ```
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Run database migrations**

   ```
   npx prisma migrate dev
   ```

5. **Start development server**
   ```
   npm run dev
   ```

## Development Guidelines

### Adding New Routes

1. Define the route in the appropriate directory under `/app`
2. Update `routes.ts` to include the new route in the appropriate access control array
3. Implement the page component with appropriate layout

### Authentication Flow

1. User data is stored in the JWT token and session
2. Role information is added to the session during the JWT callback
3. Protected routes check for authentication and role in middleware

### Component Structure

- Use the existing UI components in `/components/ui` for consistent styling
- Follow the established patterns for forms, tables, and other UI elements
- Use server actions for data mutations

