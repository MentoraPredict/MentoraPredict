import AdminTemplate from "@/components/templates/AdminTemplate";
import UserProfileManagement from "@/features/profile/components/UserProfileManagement";

export default function AdminProfilePage() {
  return (
    <AdminTemplate>
      <UserProfileManagement role="ADMIN" courses={[]} />
    </AdminTemplate>
  );
}
