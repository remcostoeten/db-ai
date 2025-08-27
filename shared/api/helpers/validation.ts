import { z } from "zod"

// Common validation schemas
export const IdSchema = z.object({
  id: z.number().positive()
})

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

export const SearchSchema = z.object({
  query: z.string().min(1).max(100)
})

export const EmailSchema = z.object({
  email: z.string().email("Invalid email address")
})

export const PasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters")
})

// Common types
export type TIdProps = z.infer<typeof IdSchema>
export type TPaginationProps = z.infer<typeof PaginationSchema>
export type TSearchProps = z.infer<typeof SearchSchema>
export type TEmailProps = z.infer<typeof EmailSchema>
export type TPasswordProps = z.infer<typeof PasswordSchema>
