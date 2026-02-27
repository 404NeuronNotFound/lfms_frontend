import { Button } from "@/components/ui/button"
import { FieldInput } from "@/components/ui/Login"


function App() {
  return (
    <>
      <div className="flex justify-center border border-dashed border-gray-400 p-4">
        <FieldInput/>
      </div>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Button>Click me</Button>
      </div>
    </>
  )
}

export default App
