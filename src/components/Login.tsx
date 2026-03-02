import { useState } from "react"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "./ui/button"
import { useAuthStore } from "@/store/authStore"

export function FieldInput() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { login, loading } = useAuthStore()

  const handleSubmit = async () => {
    try {
      await login(username, password)
    } catch (error) {
      alert("Login failed. Please check your credentials.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border">
        <FieldSet>
          <FieldGroup className="space-y-6">
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input 
                id="username" 
                type="text" 
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
               />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </FieldGroup>
        </FieldSet>
        <Button 
          className="w-full mt-6"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

      </div>
    </div>
  )
}
