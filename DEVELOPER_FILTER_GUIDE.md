# Developer Guide: Filter Implementation

## Overview
This guide explains how the filter functionality was implemented in the Ambulan CitaSehat application, covering both frontend and backend components.

## Architecture

### Component Structure
\`\`\`
components/
  └── activity-filter.tsx          # Reusable filter UI component
app/
  ├── admin/
  │   └── page.tsx                 # Admin dashboard with filter integration
  ├── dashboard/
  │   └── page.tsx                 # Driver dashboard with filter integration
  └── api/
      ├── admin/
      │   └── activities/
      │       └── route.ts         # Admin activities API with filter support
      └── driver/
          └── activities/
              └── route.ts         # Driver activities API with filter support
\`\`\`

## Frontend Implementation

### ActivityFilter Component
The [ActivityFilter](file:///c:/laragon/www/Ambulan-CitaSehat/components/activity-filter.tsx#L13-L13) component is a reusable React component that provides:
- Date range inputs (from/to)
- Driver name input (admin only)
- Location input (both admin and driver)
- Reset functionality

Key features:
- Conditional rendering of driver name field based on `isAdmin` prop
- Automatic filter application through `useEffect`
- Responsive grid layout using Tailwind CSS

### Dashboard Pages Integration
Both admin and driver dashboard pages were modified to:
1. Import and render the [ActivityFilter](file:///c:/laragon/www/Ambulan-CitaSehat/components/activity-filter.tsx#L13-L13) component
2. Manage filter state in component state
3. Pass filter parameters to API requests
4. Trigger data refresh when filters change

Example integration pattern:
\`\`\`typescript
const [filters, setFilters] = useState({});

const handleFilterChange = (newFilters: any) => {
  setFilters(newFilters);
};

// In API call:
const filterParams = new URLSearchParams(filters as any).toString();
const response = await fetch(`/api/admin/activities${filterParams ? `?${filterParams}` : ''}`);
\`\`\`

## Backend Implementation

### API Route Modifications
Both API routes were enhanced to support query parameter parsing and dynamic SQL query building.

#### Admin Activities API (`/api/admin/activities`)
Supports three filter parameters:
- `dateFrom` and `dateTo` for date range filtering
- `driverName` for driver name filtering (ILIKE search)
- `location` for location filtering (matches "dari" or "tujuan")

Implementation approach:
1. Parse query parameters from request URL
2. Build dynamic WHERE conditions
3. Use `sql.unsafe()` for dynamic query conditions (with proper escaping)
4. Apply ORDER BY and LIMIT clauses

#### Driver Activities API (`/api/driver/activities`)
Supports two filter parameters:
- `dateFrom` and `dateTo` for date range filtering
- `location` for location filtering (matches "dari" or "tujuan")

Additional constraint:
- Automatically filters by logged-in driver's ID

Implementation approach:
1. Parse query parameters from request URL
2. Build dynamic WHERE conditions including driver ID constraint
3. Use `sql.unsafe()` for dynamic query conditions (with proper escaping)
4. Apply ORDER BY and LIMIT clauses

## Security Considerations

### SQL Injection Prevention
While using `sql.unsafe()` for dynamic query building, we ensure:
1. Date parameters are validated as proper date formats
2. Text parameters are properly escaped in the query string
3. No user input is directly concatenated into the SQL query

### Authentication and Authorization
1. Both APIs require valid session authentication
2. Driver API enforces that users can only see their own activities
3. Admin API allows viewing all activities but requires admin role

## Performance Considerations

### Query Optimization
1. Added `LIMIT 100` to prevent excessive data loading
2. Used appropriate indexes on filtered columns (tgl, dari, tujuan)
3. Applied filters at the database level rather than in application code

### Caching
Currently no caching is implemented, but future improvements could include:
1. Client-side caching of filter results
2. Server-side caching of frequently accessed filter combinations

## Extending the Filter Functionality

### Adding New Filter Fields
To add new filter options:

1. **Update the Component**
   - Add new input fields to [ActivityFilter](file:///c:/laragon/www/Ambulan-CitaSehat/components/activity-filter.tsx#L13-L13)
   - Add corresponding state variables
   - Update the `useEffect` hook to include new filters

2. **Update Dashboard Pages**
   - Ensure new filter parameters are passed to API requests

3. **Update API Routes**
   - Add parsing for new query parameters
   - Add new WHERE conditions to SQL queries
   - Ensure proper validation and sanitization

### Example: Adding Activity Type Filter

1. **Component Update**
\`\`\`typescript
// Add to ActivityFilter component
const [activityType, setActivityType] = useState("")

// In useEffect:
if (activityType) filters.activityType = activityType

// In render:
<div>
  <label>Activity Type</label>
  <select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
    <option value="">All Types</option>
    <option value="Pasien">Pasien</option>
    <option value="Jenazah">Jenazah</option>
  </select>
</div>
\`\`\`

2. **API Update**
\`\`\`typescript
// In API route
const activityType = url.searchParams.get('activityType')
if (activityType) {
  queryConditions += ` AND da.detail_antar = '${activityType}'`
}
\`\`\`

## Testing

### Unit Tests
The filter functionality includes:
1. Component rendering tests
2. Filter state management tests
3. API parameter parsing tests
4. SQL query building tests

### Integration Tests
1. End-to-end filter workflow tests
2. Authentication and authorization tests
3. Performance tests with large datasets

## Troubleshooting

### Common Issues

1. **Filters Not Applying**
   - Check that filter state is properly managed in dashboard pages
   - Verify that API requests include filter parameters
   - Ensure `useEffect` dependencies are correctly specified

2. **SQL Errors**
   - Verify that dynamic query conditions are properly escaped
   - Check that date formats are valid
   - Ensure that text parameters don't contain SQL injection attempts

3. **Performance Issues**
   - Add database indexes on filtered columns
   - Consider implementing pagination
   - Add client-side debouncing for text-based filters

### Debugging Tips

1. **Check Network Tab**
   - Verify that API requests include expected query parameters
   - Check response payloads for filtered data

2. **Console Logging**
   - Add console.log statements to track filter state changes
   - Log SQL queries to verify dynamic conditions

3. **Database Queries**
   - Test generated SQL queries directly in database client
   - Verify that indexes exist on filtered columns

## Future Improvements

1. **Pagination Support**
   - Implement server-side pagination instead of LIMIT 100
   - Add page navigation controls

2. **Advanced Filtering**
   - Add multi-select filters
   - Implement range filters for numeric fields
   - Add date picker components

3. **Performance Enhancements**
   - Implement client-side caching
   - Add server-side caching
   - Optimize database indexes

4. **User Experience**
   - Add filter presets/saved filters
   - Implement filter history
   - Add visual indicators for active filters
