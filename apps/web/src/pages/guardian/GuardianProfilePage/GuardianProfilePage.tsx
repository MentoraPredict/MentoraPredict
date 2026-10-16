import GuardianTemplate from "@/components/templates/GuardianTemplate";
import UserProfileManagement from "@/features/profile/components/UserProfileManagement";

export default function GuardianProfilePage() {
  return (
    <GuardianTemplate>
      <UserProfileManagement role="GUARDIAN" courses={[]} />
    </GuardianTemplate>
  );
}
