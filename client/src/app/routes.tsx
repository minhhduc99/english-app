import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Courses } from "./pages/Courses";
import { StudentManagement } from "./pages/StudentManagement";
import { Attendance } from "./pages/Attendance";
import { Settings } from "./pages/Settings";
import { Reports } from "./pages/Reports";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { UserManagement } from "./pages/UserManagement";
import { ChangePassword } from "./pages/ChangePassword";
import { LearningMaterials } from "./pages/LearningMaterials";
import { CourseDetail } from "./pages/CourseDetail";
import { LearningPath } from "./pages/student/LearningPath";
import { AILearning } from "./pages/student/AILearning";
import { SpeakingPractice } from "./pages/student/SpeakingPractice";
import { WritingPractice } from "./pages/student/WritingPractice";
import { Flashcards } from "./pages/student/Flashcards";
import { Achievements } from "./pages/student/Achievements";
import { FlashcardManagement } from "./pages/FlashcardManagement";
import { EnglishGames } from "./pages/EnglishGames";
import { SecretStore } from "./pages/SecretStore";
import { OcrGrading } from "./pages/teacher/OcrGrading";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  { path: "/change-password", Component: ChangePassword },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "courses", Component: Courses },
      { path: "courses/:id", Component: CourseDetail },
      { path: "students", Component: StudentManagement },
      { path: "user-management", Component: UserManagement },
      { path: "attendance", Component: Attendance },
      { path: "settings", Component: Settings },
      { path: "reports", Component: Reports },
      { path: "learning-materials", Component: LearningMaterials },
      { path: "flashcard-management", Component: FlashcardManagement },
      { path: "learning-path", Component: LearningPath },
      { path: "ai-learning", Component: AILearning },
      { path: "ai-learning/speaking", Component: SpeakingPractice },
      { path: "ai-learning/writing", Component: WritingPractice },
      { path: "flashcards", Component: Flashcards },
      { path: "english-games", Component: EnglishGames },
      { path: "secret-store", Component: SecretStore },
      { path: "ocr-grading", Component: OcrGrading },
      { path: "achievements", Component: Achievements },
    ],
  },
]);
