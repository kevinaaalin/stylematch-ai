import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ServiceIntroduction from "@/components/requirements/ServiceIntroduction";
import { createPageUrl } from "@/utils";

export default function StyleTestServices() {
  const location = useLocation();
  const navigate = useNavigate();
  const flowState = location.state || {};

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ServiceIntroduction
          delivery={flowState.delivery}
          onNext={(preferredService) => navigate(createPageUrl("Requirements"), {
            state: {
              preferred_service: preferredService,
              user_email: flowState.user_email || "",
              return_to: "StyleTestServices",
            },
          })}
        />
      </div>
    </div>
  );
}
