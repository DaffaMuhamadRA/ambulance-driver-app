// Simple test to verify the ActivityFilter component renders correctly
import React from 'react';
import { render } from '@testing-library/react';
import ActivityFilter from '../components/activity-filter';

// Mock router hooks since we're not in a Next.js environment
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

describe('ActivityFilter Component', () => {
  test('renders admin filter with driver name field', () => {
    const mockOnFilterChange = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <ActivityFilter isAdmin onFilterChange={mockOnFilterChange} />
    );
    
    // Check that all filter fields are present
    expect(getByText('Tanggal Mulai')).toBeInTheDocument();
    expect(getByText('Tanggal Selesai')).toBeInTheDocument();
    expect(getByText('Nama Driver')).toBeInTheDocument();
    expect(getByText('Lokasi')).toBeInTheDocument();
    
    // Check placeholder texts
    expect(getByPlaceholderText('Cari nama driver...')).toBeInTheDocument();
    expect(getByPlaceholderText('Dari atau tujuan...')).toBeInTheDocument();
  });

  test('renders driver filter without driver name field', () => {
    const mockOnFilterChange = jest.fn();
    const { getByText, queryByText, getByPlaceholderText } = render(
      <ActivityFilter onFilterChange={mockOnFilterChange} />
    );
    
    // Check that date and location fields are present
    expect(getByText('Tanggal Mulai')).toBeInTheDocument();
    expect(getByText('Tanggal Selesai')).toBeInTheDocument();
    expect(getByText('Lokasi')).toBeInTheDocument();
    
    // Check that driver name field is NOT present
    expect(queryByText('Nama Driver')).toBeNull();
    
    // Check placeholder texts
    expect(getByPlaceholderText('Dari atau tujuan...')).toBeInTheDocument();
  });
});