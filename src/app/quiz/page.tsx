import { redirect } from 'next/navigation';

export default function QuizRedirect({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const { category } = searchParams;
  
  if (category) {
    redirect(`/quiz/${category}`);
  } else {
    redirect('/categories/classic');
  }
} 