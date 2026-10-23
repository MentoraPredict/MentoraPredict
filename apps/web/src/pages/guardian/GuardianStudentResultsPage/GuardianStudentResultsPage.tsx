import { Link, useParams } from "react-router-dom";

import Container from "@/components/atoms/Container";
import Text from "@/components/atoms/Text";
import GuardianTemplate from "@/components/templates/GuardianTemplate";
import StudentResultsReport from "@/features/students/components/StudentResultsReport";
import { APP_PATHS } from "@/routes/paths";

export default function GuardianStudentResultsPage() {
  const { studentId } = useParams();

  return (
    <GuardianTemplate>
      <Container className="py-8">
        <Link to={APP_PATHS.guardian.students} className="mb-4 inline-block">
          <Text variant="small" className="font-medium text-blue-700">
            ← Volver a mis representados
          </Text>
        </Link>

        <StudentResultsReport studentId={studentId} />
      </Container>
    </GuardianTemplate>
  );
}
