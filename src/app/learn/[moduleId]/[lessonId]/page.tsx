import { notFound } from "next/navigation";
import { LessonSidebar } from "@/components/learn/LessonSidebar";
import { LessonContent } from "@/components/learn/LessonContent";
import { modules, getModule, getLesson } from "@/data/modules";

export function generateStaticParams() {
  return modules.flatMap((m) =>
    m.lessons.map((l) => ({ moduleId: m.id, lessonId: l.id }))
  );
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>;
}) {
  const { moduleId, lessonId } = await params;
  const mod = getModule(moduleId);
  const lesson = getLesson(moduleId, lessonId);

  if (!mod || !lesson) notFound();

  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleId: m.id }))
  );
  const currentIndex = allLessons.findIndex(
    (l) => l.moduleId === moduleId && l.id === lessonId
  );

  const prevLesson =
    currentIndex > 0
      ? {
          moduleId: allLessons[currentIndex - 1].moduleId,
          lessonId: allLessons[currentIndex - 1].id,
          title: allLessons[currentIndex - 1].title,
        }
      : null;

  const nextLesson =
    currentIndex < allLessons.length - 1
      ? {
          moduleId: allLessons[currentIndex + 1].moduleId,
          lessonId: allLessons[currentIndex + 1].id,
          title: allLessons[currentIndex + 1].title,
        }
      : null;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5.25rem)] min-h-0">
      <LessonSidebar
        modules={modules}
        activeModuleId={moduleId}
        activeLessonId={lessonId}
      />
      <LessonContent
        lesson={lesson}
        moduleTitle={mod.title}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
      />
    </div>
  );
}