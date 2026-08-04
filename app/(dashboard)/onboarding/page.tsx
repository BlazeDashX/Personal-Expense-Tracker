import { getOnboardingData } from "@/features/onboarding/queries/get-onboarding";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";

export default async function OnboardingPage() {
  const data = await getOnboardingData();

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12">
      <OnboardingWizard data={data} />
    </div>
  );
}
