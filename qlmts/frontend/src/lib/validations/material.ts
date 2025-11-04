import { z } from 'zod';

// Heat validation schema
export const heatSchema = z.object({
  heatNo: z.string()
    .min(1, 'Heat number is required')
    .max(50, 'Heat number must be less than 50 characters')
    .regex(/^[A-Za-z0-9\-\/\.]+$/, 'Invalid heat number format')
    .transform(val => val.toUpperCase()),
  
  supplierId: z.string()
    .uuid('Invalid supplier ID'),
  
  materialGrade: z.string()
    .min(1, 'Material grade is required')
    .max(100, 'Material grade too long'),
  
  receivedOn: z.string()
    .refine((date) => {
      const receivedDate = new Date(date);
      const now = new Date();
      return receivedDate <= now;
    }, 'Received date cannot be in the future'),
  
  quantity: z.number()
    .positive('Quantity must be positive')
    .max(999999.999, 'Quantity too large'),
  
  unit: z.enum(['KG', 'MT', 'LBS', 'PCS'], {
    errorMap: () => ({ message: 'Invalid unit' })
  }),
  
  poNumber: z.string()
    .max(50, 'PO number too long')
    .optional()
    .or(z.literal('')),
  
  grnNumber: z.string()
    .max(50, 'GRN number too long')
    .optional()
    .or(z.literal('')),
  
  mtcId: z.string()
    .uuid('Invalid MTC ID')
    .optional()
    .or(z.literal('')),
});

// Batch validation schema
export const batchSchema = z.object({
  batchNo: z.string()
    .min(1, 'Batch number is required')
    .max(20, 'Batch number too long'),
  
  heatId: z.string()
    .uuid('Invalid heat ID'),
  
  quantity: z.number()
    .positive('Quantity must be positive')
    .max(999999.999, 'Quantity too large'),
  
  unit: z.enum(['KG', 'MT', 'LBS', 'PCS']),
  
  location: z.string()
    .max(100, 'Location too long')
    .optional()
    .or(z.literal('')),
  
  splitParentId: z.string()
    .uuid('Invalid parent batch ID')
    .optional()
    .or(z.literal('')),
});

// Split batch validation schema
export const splitBatchSchema = z.object({
  quantities: z.array(z.number().positive('Quantity must be positive'))
    .min(2, 'At least 2 quantities required for splitting')
    .max(10, 'Maximum 10 split batches allowed'),
  
  locations: z.array(z.string().max(100, 'Location too long'))
    .optional(),
}).refine(
  (data) => !data.locations || data.locations.length === data.quantities.length,
  {
    message: 'Number of locations must match number of quantities',
    path: ['locations'],
  }
);

// Heat query schema
export const heatQuerySchema = z.object({
  heatNo: z.string().optional(),
  supplierId: z.string().uuid().optional(),
  materialGrade: z.string().optional(),
  receivedFrom: z.string().optional(),
  receivedTo: z.string().optional(),
  poNumber: z.string().optional(),
  grnNumber: z.string().optional(),
  unit: z.enum(['KG', 'MT', 'LBS', 'PCS']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['heatNo', 'receivedOn', 'materialGrade', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Types
export type HeatFormData = z.infer<typeof heatSchema>;
export type BatchFormData = z.infer<typeof batchSchema>;
export type SplitBatchFormData = z.infer<typeof splitBatchSchema>;
export type HeatQueryData = z.infer<typeof heatQuerySchema>;