const form = document.querySelector('.enrollment-form');

function setCourseText(selector, key, value) {
  const element = document.querySelector(selector);
  element.dataset.i18n = key;
  element.textContent = value;
}

function showCourse(course) {
  const key = `catalog.${course.id}`;
  for (const element of document.querySelectorAll('[data-frontend-only]')) {
    element.hidden = true;
  }
  document.querySelector('[data-course-rating]').textContent = `★ ${course.rating}`;

  if (form) {
    form.elements.namedItem('course').value = course.id;
    setCourseText('.selected-course-card__title', `${key}.title`, course.title);
    setCourseText('.selected-course-card__author', `${key}.author`, course.author);
    setCourseText('[data-i18n="enrollment.courseMetaItem"]', `${key}.duration`, course.duration);
    return;
  }

  setCourseText('title', `${key}.pageTitle`, `${course.title} | Codeva`);
  setCourseText('.course-hero__category', `${key}.category`, course.category);
  setCourseText('.course-hero__title', `${key}.title`, course.title);
  setCourseText('.course-hero__subtitle', `${key}.description`, course.description);
  setCourseText('.instructor-card__name', `${key}.instructor`, course.author.replace(/^by /, ''));
  setCourseText('[data-i18n="details.courseMetaItem"]', `${key}.duration`, course.duration);
  document.querySelector('.course-cta-card__button').href = `form.html?course=${course.id}`;
  document.querySelector('meta[name="description"]').content = course.description;

  const schema = document.querySelector('script[type="application/ld+json"]');
  const courseSchema = JSON.parse(schema.textContent);
  courseSchema.name = course.title;
  courseSchema.description = course.description;
  schema.textContent = JSON.stringify(courseSchema);
}

async function initializeCoursePage() {
  const courseId = new URLSearchParams(window.location.search).get('course');
  if (courseId && courseId !== 'frontend') {
    const response = await fetch(new URL('./data/courses.json', import.meta.url));
    if (!response.ok) throw new Error(`Course catalog returned HTTP ${response.status}`);
    const courses = await response.json();
    const course = courses.find(({ id }) => id === courseId);
    if (course) showCourse(course);
  }

  if (form) {
    const status = document.querySelector('#enrollment-status');
    const confirmation = document.querySelector('#enrollment-confirmation');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.reset();
      status.replaceChildren(confirmation.content.cloneNode(true));
    });
    form.addEventListener('input', () => status.replaceChildren());
    form.querySelector('button[type="submit"]').disabled = false;
  }
}

initializeCoursePage().catch((error) => console.error(error));
