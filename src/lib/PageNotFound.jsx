import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center max-w-md px-6">
        <h1 className="text-6xl font-bold text-stone-300 mb-4">404</h1>
        <p className="text-xl text-stone-700 mb-6">找不到這個頁面</p>
        <Link to="/">
          <Button>返回首頁</Button>
        </Link>
      </div>
    </div>
  );
}
