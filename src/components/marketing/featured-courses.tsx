import { getPublishedCourseCards } from "@/server/courses";
import { CourseCarousel } from "./course-carousel";

// Server component — single source of truth is the DB (BUILD_SPEC §1, §7.1).
export async function FeaturedCourses() {
  const courses = await getPublishedCourseCards();
  return <CourseCarousel courses={courses} />;
}
