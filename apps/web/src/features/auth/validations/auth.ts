import { z } from "zod"

const MIN_PASSWORD_LENGTH = 8

export const EmailSchema = z.object({
  email: z.string().email("Invalid email address")
})

export const PasswordSchema = z.object({
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
})

export const NameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters")
})

export const SignInSchema = EmailSchema.merge(PasswordSchema)

export const SignUpSchema = NameSchema.merge(EmailSchema).merge(PasswordSchema)

export const AuthSchema = EmailSchema

export type TEmailProps = z.infer<typeof EmailSchema>
export type TPasswordProps = z.infer<typeof PasswordSchema>
export type TNameProps = z.infer<typeof NameSchema>
export type TSignInProps = z.infer<typeof SignInSchema>
export type TSignUpProps = z.infer<typeof SignUpSchema>
export type TAuthProps = z.infer<typeof AuthSchema>