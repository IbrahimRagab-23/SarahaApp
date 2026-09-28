import { z } from "zod";

export const loginZ = z.object({
    email: z.email("Invalid email format"),
    password: z.string()
        .min(6)
        .max(16)
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,16}$/, 
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
});

export const signupZ = loginZ.extend({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    DOB: z.string().min(1, "Date of birth is required"),
    
    confirmPassword: z.string()
        .min(6)
        .max(16),
        
    phone: z.string().regex(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/, "Invalid phone number"),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});