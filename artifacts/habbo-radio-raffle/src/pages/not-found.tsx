import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#72a1b1' }}>
      <div className="habbo-panel p-8 text-center max-w-md mx-4">
        <div className="flex mb-4 gap-2 items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
        </div>
        <p className="mt-4 text-sm text-gray-600">Página no encontrada</p>
      </div>
    </div>
  );
}
