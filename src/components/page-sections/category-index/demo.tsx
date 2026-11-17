import { CategoryIndex } from './CategoryIndex';
import { sampleCategories } from '@/lib/sample-data';

export default function CategoryIndexDemo() {
  return <CategoryIndex categories={sampleCategories} />;
}
