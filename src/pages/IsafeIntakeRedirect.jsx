import { useEffect } from "react";

const ISAFE_INTAKE_URL = import.meta.env.VITE_ISAFE_INTAKE_URL || "http://127.0.0.1:4174/?view=home&intake=1";

export default function IsafeIntakeRedirect() {
  useEffect(() => { window.location.replace(ISAFE_INTAKE_URL); }, []);
  return <div className="min-h-[50vh]" aria-live="polite" />;
}
