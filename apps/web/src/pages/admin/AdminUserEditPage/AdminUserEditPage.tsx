import { useParams } from "react-router-dom";

import AdminTemplate from "@/components/templates/AdminTemplate";
import AdminUserEdit from "@/features/admin/components/AdminUserEdit";

export default function AdminUserEditPage() {
  const { userId } = useParams();

  return (
    <AdminTemplate>
      {userId ? <AdminUserEdit userId={userId} /> : null}
    </AdminTemplate>
  );
}
