
import { 
  useFetchLaundries, 
  useCreateLaundry,
  useUpdateLaundry,
  useDeleteLaundry 
} from './laundry';

// Re-export the hooks with their original names
export { 
  useFetchLaundries, 
  useCreateLaundry,
  useUpdateLaundry,
  useDeleteLaundry 
};

// Also export useFetchLaundries as useLaundries for backward compatibility
export const useLaundries = useFetchLaundries;
